// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import { TIP20Factory } from "./TIP20Factory.sol";
import { TIP20RolesAuth } from "./TIP20RolesAuth.sol";
import { TIP403Registry } from "./TIP403Registry.sol";
import { TIP4217Registry } from "./TIP4217Registry.sol";

contract TIP20 is TIP20RolesAuth {

    TIP403Registry internal constant TIP403_REGISTRY =
        TIP403Registry(0x403c000000000000000000000000000000000000);

    TIP4217Registry internal constant TIP4217_REGISTRY =
        TIP4217Registry(0x4217c00000000000000000000000000000000000);

    address internal constant TIP_FEE_MANAGER_ADDRESS = 0xfeEC000000000000000000000000000000000000;

    address internal constant FACTORY = 0x20Fc000000000000000000000000000000000000;

    /*//////////////////////////////////////////////////////////////
                                METADATA
    //////////////////////////////////////////////////////////////*/

    string public name;
    string public symbol;
    string public currency;

    function decimals() public view returns (uint8) {
        return TIP4217_REGISTRY.getCurrencyDecimals(currency);
    }

    bytes32 public immutable DOMAIN_SEPARATOR;

    /*//////////////////////////////////////////////////////////////
                             ADMINISTRATION
    //////////////////////////////////////////////////////////////*/

    TIP20 public quoteToken;
    TIP20 public nextQuoteToken;

    bytes32 public constant PAUSE_ROLE = keccak256("PAUSE_ROLE");
    bytes32 public constant UNPAUSE_ROLE = keccak256("UNPAUSE_ROLE");
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");
    bytes32 public constant BURN_BLOCKED_ROLE = keccak256("BURN_BLOCKED_ROLE");

    uint64 public transferPolicyId = 1; // "Always-allow" policy by default.

    constructor(
        string memory _name,
        string memory _symbol,
        string memory _currency,
        TIP20 _quoteToken,
        address admin
    ) {
        name = _name;
        symbol = _symbol;
        currency = _currency;
        quoteToken = _quoteToken;
        nextQuoteToken = _quoteToken;
        if (decimals() == 0) revert InvalidCurrency();

        hasRole[admin][DEFAULT_ADMIN_ROLE] = true; // Grant admin role to first admin.

        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256(
                    "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
                ),
                keccak256(bytes(_name)),
                keccak256(bytes("1")),
                block.chainid,
                address(this)
            )
        );
    }

    /*//////////////////////////////////////////////////////////////
                              ERC20 STORAGE
    //////////////////////////////////////////////////////////////*/

    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    mapping(address => uint256) public nonces;

    /*//////////////////////////////////////////////////////////////
                              TIP20 STORAGE
    //////////////////////////////////////////////////////////////*/

    bool public paused = false;
    uint256 public supplyCap = type(uint256).max; // Default to no supply cap.

    /*//////////////////////////////////////////////////////////////
                                 ERRORS
    //////////////////////////////////////////////////////////////*/

    error PolicyForbids();
    error InvalidRecipient();
    error InsufficientBalance();
    error InsufficientAllowance();
    error InvalidSignature();
    error Expired();
    error SupplyCapExceeded();
    error ContractPaused();
    error InvalidCurrency();
    error InvalidQuoteToken();

    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

    event TransferPolicyUpdate(address indexed updater, uint64 indexed newPolicyId);
    event Mint(address indexed to, uint256 amount);
    event Burn(address indexed from, uint256 amount);
    event BurnBlocked(address indexed from, uint256 amount);
    event Transfer(address indexed from, address indexed to, uint256 amount);
    event TransferWithMemo(
        address indexed from, address indexed to, uint256 amount, bytes32 indexed memo
    );
    event Approval(address indexed owner, address indexed spender, uint256 amount);
    event SupplyCapUpdate(address indexed updater, uint256 indexed newSupplyCap);
    event PauseStateUpdate(address indexed updater, bool isPaused);
    event NextQuoteTokenSet(address indexed updater, TIP20 indexed nextQuoteToken);
    event QuoteTokenUpdate(address indexed updater, TIP20 indexed newQuoteToken);

    /*//////////////////////////////////////////////////////////////
                          POLICY ADMINISTRATION
    //////////////////////////////////////////////////////////////*/

    function changeTransferPolicyId(uint64 newPolicyId) external onlyRole(DEFAULT_ADMIN_ROLE) {
        emit TransferPolicyUpdate(msg.sender, transferPolicyId = newPolicyId);
    }

    /*//////////////////////////////////////////////////////////////
                          TOKEN ADMINISTRATION
    //////////////////////////////////////////////////////////////*/

    function setNextQuoteToken(TIP20 newQuoteToken) external onlyRole(DEFAULT_ADMIN_ROLE) {
        // sets next quote token, to put the DEX for that pair into place-only mode
        // does not check for loops; that is checked in completeQuoteTokenUpdate
        if (!TIP20Factory(FACTORY).isTIP20(address(newQuoteToken))) {
            revert InvalidQuoteToken();
        }

        nextQuoteToken = newQuoteToken;
        emit NextQuoteTokenSet(msg.sender, newQuoteToken);
    }

    function completeQuoteTokenUpdate() external onlyRole(DEFAULT_ADMIN_ROLE) {
        // check that this does not create a loop, by looping through quote token until we reach the root
        TIP20 current = nextQuoteToken;
        while (address(current) != 0x20C0000000000000000000000000000000000000) {
            if (current == this) revert InvalidQuoteToken();
            current = current.quoteToken();
        }

        quoteToken = nextQuoteToken;
        emit QuoteTokenUpdate(msg.sender, nextQuoteToken);
    }

    function setSupplyCap(uint256 newSupplyCap) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (newSupplyCap < totalSupply) revert SupplyCapExceeded();
        emit SupplyCapUpdate(msg.sender, supplyCap = newSupplyCap);
    }

    function pause() external onlyRole(PAUSE_ROLE) {
        emit PauseStateUpdate(msg.sender, paused = true);
    }

    function unpause() external onlyRole(UNPAUSE_ROLE) {
        emit PauseStateUpdate(msg.sender, paused = false);
    }

    function mint(address to, uint256 amount) external onlyRole(ISSUER_ROLE) {
        _mint(to, amount);
        emit Mint(to, amount);
    }

    function burn(uint256 amount) external onlyRole(ISSUER_ROLE) {
        _transfer(msg.sender, address(0), amount);
        unchecked {
            totalSupply -= amount;
        }

        emit Burn(msg.sender, amount);
    }

    function burnBlocked(address from, uint256 amount) external onlyRole(BURN_BLOCKED_ROLE) {
        // Only allow burning from addresses that are blocked from transferring.
        if (TIP403_REGISTRY.isAuthorized(transferPolicyId, from)) {
            revert PolicyForbids();
        }

        _transfer(from, address(0), amount);
        unchecked {
            totalSupply -= amount;
        }

        emit BurnBlocked(from, amount);
    }

    function mintWithMemo(address to, uint256 amount, bytes32 memo)
        external
        onlyRole(ISSUER_ROLE)
    {
        _mint(to, amount);
        emit TransferWithMemo(address(0), to, amount, memo);
        emit Mint(to, amount);
    }

    function burnWithMemo(uint256 amount, bytes32 memo) external onlyRole(ISSUER_ROLE) {
        _transfer(msg.sender, address(0), amount);
        unchecked {
            totalSupply -= amount;
        }

        emit TransferWithMemo(msg.sender, address(0), amount, memo);
        emit Burn(msg.sender, amount);
    }

    /*//////////////////////////////////////////////////////////////
                        STANDARD ERC20 FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    modifier notPaused() {
        if (paused) revert ContractPaused();
        _;
    }

    modifier notTokenAddress(address to) {
        // Don't allow sending to other precompiled tokens.
        if ((uint160(to) >> 64) == 0x200000000000000000000000) {
            revert InvalidRecipient();
        }
        _;
    }

    modifier transferAuthorized(address from, address to) {
        if (
            !TIP403_REGISTRY.isAuthorized(transferPolicyId, from)
                || !TIP403_REGISTRY.isAuthorized(transferPolicyId, to)
        ) revert PolicyForbids();
        _;
    }

    function transfer(address to, uint256 amount)
        external
        virtual
        notPaused
        notTokenAddress(to)
        transferAuthorized(msg.sender, to)
        returns (bool)
    {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        emit Approval(msg.sender, spender, allowance[msg.sender][spender] = amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount)
        external
        virtual
        notPaused
        notTokenAddress(to)
        transferAuthorized(from, to)
        returns (bool)
    {
        _transferFrom(from, to, amount);
        return true;
    }

    function _transferFrom(address from, address to, uint256 amount) internal {
        // Allowance check and update.
        uint256 allowed = allowance[from][msg.sender];
        if (amount > allowed) revert InsufficientAllowance();
        unchecked {
            if (allowed != type(uint256).max) {
                allowance[from][msg.sender] = allowed - amount;
            }
        }

        _transfer(from, to, amount);
    }

    function permit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        if (block.timestamp > deadline) revert Expired();

        // Unchecked because the only math done is incrementing
        // the owner's nonce which cannot realistically overflow.
        unchecked {
            bytes32 digest = keccak256(
                abi.encodePacked(
                    "\x19\x01",
                    DOMAIN_SEPARATOR,
                    keccak256(
                        abi.encode(
                            keccak256(
                                "Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"
                            ),
                            owner,
                            spender,
                            value,
                            nonces[owner]++,
                            deadline
                        )
                    )
                )
            );

            // Signature check.
            address recovered = ecrecover(digest, v, r, s);
            if (recovered != owner || recovered == address(0)) {
                revert InvalidSignature();
            }

            allowance[owner][spender] = value;
        }

        emit Approval(owner, spender, value);
    }

    function _transfer(address from, address to, uint256 amount) internal {
        if (amount > balanceOf[from]) revert InsufficientBalance();
        unchecked {
            balanceOf[from] -= amount;
            if (to != address(0)) balanceOf[to] += amount;
        }

        emit Transfer(from, to, amount);
    }

    function _mint(address to, uint256 amount) internal {
        if (totalSupply + amount > supplyCap) revert SupplyCapExceeded(); // Catches overflow.
        unchecked {
            totalSupply += amount;
            balanceOf[to] += amount;
        }

        emit Transfer(address(0), to, amount);
    }

    /*//////////////////////////////////////////////////////////////
                        TIP20 EXTENSION FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function transferWithMemo(address to, uint256 amount, bytes32 memo)
        external
        virtual
        notPaused
        notTokenAddress(to)
        transferAuthorized(msg.sender, to)
    {
        _transfer(msg.sender, to, amount);
        emit TransferWithMemo(msg.sender, to, amount, memo);
    }

    function transferFromWithMemo(address from, address to, uint256 amount, bytes32 memo)
        external
        virtual
        notPaused
        notTokenAddress(to)
        transferAuthorized(from, to)
        returns (bool)
    {
        // Allowance check and update.
        uint256 allowed = allowance[from][msg.sender];
        if (amount > allowed) revert InsufficientAllowance();
        unchecked {
            if (allowed != type(uint256).max) {
                allowance[from][msg.sender] = allowed - amount;
            }
        }

        _transfer(from, to, amount);
        emit TransferWithMemo(from, to, amount, memo);
        return true;
    }

    /// @dev In the Tempo node implementation, this function is not exposed via the TIP20 interface
    /// and is not externally callable. It is only invoked internally by specific precompiles
    /// (like the fee manager precompile), avoiding the need to approve precompiles to spend tokens.
    function systemTransferFrom(address from, address to, uint256 amount)
        external
        virtual
        notPaused
        notTokenAddress(to)
        transferAuthorized(from, to)
        returns (bool)
    {
        require(msg.sender == TIP_FEE_MANAGER_ADDRESS);
        _transfer(from, to, amount);
        return true;
    }

    /*//////////////////////////////////////////////////////////////
                            FEE MANAGEMENT
    //////////////////////////////////////////////////////////////*/

    function transferFeePreTx(address from, uint256 amount) external {
        require(msg.sender == TIP_FEE_MANAGER_ADDRESS);

        if (amount > balanceOf[from]) revert InsufficientBalance();

        unchecked {
            balanceOf[from] -= amount;
            balanceOf[TIP_FEE_MANAGER_ADDRESS] += amount;
        }
    }

    function transferFeePostTx(address to, uint256 refund, uint256 actualUsed) external {
        require(msg.sender == TIP_FEE_MANAGER_ADDRESS);

        uint256 feeManagerBalance = balanceOf[TIP_FEE_MANAGER_ADDRESS];
        if (refund > feeManagerBalance) revert InsufficientBalance();

        unchecked {
            balanceOf[TIP_FEE_MANAGER_ADDRESS] -= refund;
            balanceOf[to] += refund;
        }

        emit Transfer(to, TIP_FEE_MANAGER_ADDRESS, actualUsed);
    }

}
