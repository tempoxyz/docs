import { client } from './network.config'

// [!region create]
const { token } = await client.token.createSync({
  name: 'Demo USD',
  symbol: 'DEMO',
  currency: 'USD',
})
console.log(token)
// [!endregion create]

// [!region roles]
await client.token.grantRolesSync({
  token,
  roles: ['issuer'],
  to: client.account.address,
})
// [!endregion roles]

// [!region mint]
await client.token.mintSync({
  token,
  to: client.account.address,
  amount: 100_000_000n,
})
// [!endregion mint]
