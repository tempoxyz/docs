// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

abstract contract TIP20RolesAuth {

    error Unauthorized();

    event RoleMembershipUpdated(
        bytes32 indexed role, address indexed account, address indexed sender, bool hasRole
    );

    event RoleAdminUpdated(
        bytes32 indexed role, bytes32 indexed newAdminRole, address indexed sender
    );

    mapping(address account => mapping(bytes32 role => bool)) internal hasRole;
    mapping(bytes32 role => bytes32 adminRole) internal roleAdmin;

    bytes32 internal constant DEFAULT_ADMIN_ROLE = 0; // Roles with unset admins will yield this role as admin.
    bytes32 internal constant UNGRANTABLE_ROLE = bytes32(type(uint256).max); // Can never be granted to anyone.

    constructor() {
        // Prevent granting this role by making it self-adminstered.
        roleAdmin[UNGRANTABLE_ROLE] = UNGRANTABLE_ROLE;
    }

    modifier onlyRole(bytes32 role) {
        if (!hasRole[msg.sender][role]) revert Unauthorized();
        _;
    }

    function grantRole(bytes32 role, address account) external onlyRole(roleAdmin[role]) {
        hasRole[account][role] = true;
        emit RoleMembershipUpdated(role, account, msg.sender, true);
    }

    function revokeRole(bytes32 role, address account) external virtual onlyRole(roleAdmin[role]) {
        hasRole[account][role] = false;
        emit RoleMembershipUpdated(role, account, msg.sender, false);
    }

    function renounceRole(bytes32 role) external virtual onlyRole(role) {
        hasRole[msg.sender][role] = false;
        emit RoleMembershipUpdated(role, msg.sender, msg.sender, false);
    }

    function setRoleAdmin(bytes32 role, bytes32 adminRole)
        external
        virtual
        onlyRole(roleAdmin[role])
    {
        roleAdmin[role] = adminRole;
        emit RoleAdminUpdated(role, adminRole, msg.sender);
    }

}
