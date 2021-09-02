# dGrants Frontend Application

Ethereum frontend app built with the following stack:

- [Vue 3](https://v3.vuejs.org/) as the foundation
- [Tailwind CSS](https://tailwindcss.com) for styling
- [Ethers](https://docs.ethers.io/v5/single-page/) for interacting with Ethereum
- [Vite](https://vitejs.dev/) for 10x-100x faster builds
- [Onboard](https://docs.blocknative.com/onboard) for connecting wallets
- [Multicall2](https://github.com/makerdao/multicall) for polling for data each block

## Setup

Install MetaMask and configure it with the default Hardhat mnemonic of `test test test test test test test test test test test junk`.
If you already have MetaMask installed, it may be easier to create a new browser profile called "Hardhat" so you can configure MetaMask with this mnemonic without affecting your existing MetaMask installation.

Then, add a network to MetaMask with the following information:

- Name: Hardhat
- New RPC URL: http://127.0.0.1:8545
- Chain ID: 31337

This configuration is required to ensure your account is funded with tokens for testing.
When you rebuild the app, you'll likely need to reset MetaMask so the nonces match what the local network expects.
You can do this in MetaMask by clicking the circle in the top right > Settings > Advanced > Reset Account.

You can now build the app with:

```sh
# Install packages
yarn install

# Run in development mode (run this fom the repo root)
yarn dev

# Compiles and minifies for production
yarn build

# Format files
yarn prettier

# Run linter
yarn lint

### Run your unit tests and end-to-end tests (not yet setup)
yarn test:unit
yarn test:e2e
```

### Troubleshooting

If you send a transaction in MetaMask against your local node, then restart your local node, your next transaction will use a nonce that is too large and your transaction will fail. To fix this, go to MetaMask Settings > Advanced > Reset Account. This will reset the MetaMask nonce counter so it matches what Hardhat is expecting.

If you see `project ID does not have access to archive state` in the terminal, simply quit the process and re-run `yarn dev`. This happens because Infura only gives access to the last 128 blocks of data (~30 minutes), unless you pay for an archive node plan. If you leave your forked mainnet node running for longer than this, it tries to query for data older than 128 blocks and fails. Restarting your node re-forks from the latest mainnet block.

If the app loads and the block number is zero after connecting your wallet, there's likely a `CALL_EXCEPTION` in the console. Simply refresh the page and this should be fixed.
