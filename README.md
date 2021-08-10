# dgrants

## Directory Structure
```
.
├── app                     # Frontend Vue.js application
├── contracts               # Smart contracts
├── doc                     # Project documentation including the protocol definition
├── lerna.json              # Lerna config
├── package.json            # Root package configuration
├── tsconfig.json           # Typescript configuration
├── tsconfig.settings.json  # Typescript configuration
├── types                   # Shared types
├── vetur.config.js         # Vetur configuration
├── yarn.lock               # Yarn lock file
└── README.md
```

## Contributing Guideline

Checkout the [CONTRIBUTING.md](https://github.com/dcgtc/dgrants/blob/contributing-guide/CONTRIBUTING.md) if you'd like to help with building dGrants


## Development

This project is a monorepo with two packages:

- `contracts/` contains the smart contracts
- `app/` is a frontend

### Dependencies

To ensure that everyone is using the same version of nodejs on this project, [volta](https://volta.sh) is recommended!

### Set your env files

Copy `app/.env.template` to `app/.env` and edit, providing your own env vars. You will have to supply a [Blocknative](https://www.blocknative.com/) API key and an [Infura](https://infura.io/) Project ID. Both services have free tiers which are sufficient for development.

```bash
cp app/.env.template app/.env
```

Copy `contracts/.env.template` to `contracts/.env` and edit, providing your own env vars

```bash
cp contracts/.env.template contracts/.env
```

You will have to supply an [Infura](https://infura.io/) Project ID. An account with their free tier is sufficient for development.

### Develop

```sh
yarn
yarn dev
```

### Lint

```sh
yarn lint
```

### Test

```sh
yarn test
```

### Build

```sh
yarn build
```

#### Note: Subdirectory Development

If you are working on one component or the other, you can use workspace aliases to run commands defined in the corresponding `package.json` independently.

For example, to run smart contract tests only:

```bash
yarn contracts test
```

or to start the frontend locally in development mode:

```bash
yarn app dev
```

# Help Build Decentralized Gitcoin

<strong>As of August 2021, Gitcoin Holdings is Hiring Engineers</strong> -- Say hi in the #decentralize-gitcoin channel on the [Gitcoin Discord](https://gitcoin.co/discord) to get involve

