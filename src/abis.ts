export const TIP20_FACTORY_ABI = [
  {
    name: 'createToken',
    type: 'function',
    inputs: [
      { name: 'name', type: 'string' },
      { name: 'symbol', type: 'string' },
      { name: 'currency', type: 'string' },
      { name: 'admin', type: 'address' }
    ],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'nonpayable'
  },
  {
    name: 'tokenIdCounter',
    type: 'function',
    inputs: [],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view'
  },
  {
    name: 'TokenCreated',
    type: 'event',
    inputs: [
      { name: 'tokenId', type: 'uint256', indexed: true },
      { name: 'name', type: 'string', indexed: false },
      { name: 'symbol', type: 'string', indexed: false },
      { name: 'currency', type: 'string', indexed: false },
      { name: 'admin', type: 'address', indexed: false }
    ]
  }
] as const;

export const TIP20_ABI = [
  // Standard token functions
  {
    name: 'name',
    type: 'function',
    inputs: [],
    outputs: [{ type: 'string' }],
    stateMutability: 'view'
  },
  {
    name: 'symbol',
    type: 'function',
    inputs: [],
    outputs: [{ type: 'string' }],
    stateMutability: 'view'
  },
  {
    name: 'decimals',
    type: 'function',
    inputs: [],
    outputs: [{ type: 'uint8' }],
    stateMutability: 'view'
  },
  {
    name: 'totalSupply',
    type: 'function',
    inputs: [],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view'
  },
  {
    name: 'balanceOf',
    type: 'function',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view'
  },
  {
    name: 'transfer',
    type: 'function',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ type: 'bool' }],
    stateMutability: 'nonpayable'
  },
  {
    name: 'approve',
    type: 'function',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ type: 'bool' }],
    stateMutability: 'nonpayable'
  },
  {
    name: 'allowance',
    type: 'function',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view'
  },
  {
    name: 'transferFrom',
    type: 'function',
    inputs: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ type: 'bool' }],
    stateMutability: 'nonpayable'
  },
  // TIP20 Extensions
  {
    name: 'currency',
    type: 'function',
    inputs: [],
    outputs: [{ type: 'string' }],
    stateMutability: 'view'
  },
  {
    name: 'supplyCap',
    type: 'function',
    inputs: [],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view'
  },
  {
    name: 'paused',
    type: 'function',
    inputs: [],
    outputs: [{ type: 'bool' }],
    stateMutability: 'view'
  },
  {
    name: 'transferPolicyId',
    type: 'function',
    inputs: [],
    outputs: [{ type: 'uint64' }],
    stateMutability: 'view'
  },
  // Token Management
  {
    name: 'setSupplyCap',
    type: 'function',
    inputs: [{ name: 'supplyCap', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    name: 'mint',
    type: 'function',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    name: 'burn',
    type: 'function',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  // Events
  {
    name: 'Transfer',
    type: 'event',
    inputs: [
      { name: 'from', type: 'address', indexed: true },
      { name: 'to', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false }
    ]
  },
  {
    name: 'Approval',
    type: 'event',
    inputs: [
      { name: 'owner', type: 'address', indexed: true },
      { name: 'spender', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false }
    ]
  },
  {
    name: 'Mint',
    type: 'event',
    inputs: [
      { name: 'to', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false }
    ]
  }
] as const;

export const ROLES_AUTH_ABI = [
  {
    name: 'grantRole',
    type: 'function',
    inputs: [
      { name: 'role', type: 'bytes32' },
      { name: 'account', type: 'address' }
    ],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    name: 'revokeRole',
    type: 'function',
    inputs: [
      { name: 'role', type: 'bytes32' },
      { name: 'account', type: 'address' }
    ],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    name: 'hasRole',
    type: 'function',
    inputs: [
      { name: 'account', type: 'address' },
      { name: 'role', type: 'bytes32' }
    ],
    outputs: [{ type: 'bool' }],
    stateMutability: 'view'
  },
  {
    name: 'RoleMembershipUpdated',
    type: 'event',
    inputs: [
      { name: 'role', type: 'bytes32', indexed: true },
      { name: 'account', type: 'address', indexed: true },
      { name: 'sender', type: 'address', indexed: true },
      { name: 'hasRole', type: 'bool', indexed: false }
    ]
  }
] as const;

export const FEE_MANAGER_ABI = [
  {
    name: 'userTokens',
    type: 'function',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ type: 'address' }],
    stateMutability: 'view'
  },
  {
    name: 'setUserToken',
    type: 'function',
    inputs: [{ name: 'token', type: 'address' }],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    name: 'getFeeTokenBalance',
    type: 'function',
    inputs: [
      { name: 'sender', type: 'address' },
      { name: 'validator', type: 'address' }
    ],
    outputs: [
      { name: 'token', type: 'address' },
      { name: 'balance', type: 'uint256' }
    ],
    stateMutability: 'view'
  }
] as const;