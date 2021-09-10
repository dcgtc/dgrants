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

Checkout the [CONTRIBUTING.md](https://github.com/dcgtc/dgrants/blob/main/CONTRIBUTING.md) if you'd like to help with building dGrants


## Development

This project is a monorepo with two packages:

- `contracts/` contains the smart contracts
- `app/` is a frontend

### Dependencies

To ensure that everyone is using the same version of nodejs on this project, [volta](https://volta.sh) is recommended!

### Set your env files

Copy `app/.env.template` to `app/.env` and edit, providing your own env vars. You will have to supply a [Blocknative](https://www.blocknative.com/) API key and an [Alchemy](https://www.alchemy.com/) API key. Both services have free tiers which are sufficient for development.

```bash
cp app/.env.template app/.env
```

Copy `contracts/.env.template` to `contracts/.env` and edit, providing your own env vars

```bash
cp contracts/.env.template contracts/.env
```

You will have to supply an [Alchemy](https://www.alchemy.com//) API Key. An account with their free tier is sufficient for development. You'll also need a [Fleek](https://fleek.co/) IPFS endpoint key in your .env file.

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

### Version Management & Changelogs

Versioning and Changelogs are managed by Lerna.

#### Version Management
Guidance around when to increase versions is coming soon.

To increase the version number and include the short hash of the git commit ID, use the following commands.
```
$ yarn bump:patch
$ yarn bump:minor
$ yarn bump:major
```

To promote a pre-release version to release which removes the short hash from the version, use the following commands.
```
$ yarn release:patch
$ yarn release:minor
$ yarn release:major
```

#### Changelog Requirements
In order for merged PRs to be added to the changelog, you must use one of the following tags in Github for each PR.

+ enhancement - A feature or addition to the codebase
+ bug - A fix for a bug
+ breaking - A change that breaks compatability or requires configuration changes
+ documentation - Changes or additions to documentation
+ internal - Changes or updates to build mechanisms

# Help Build Decentralized Gitcoin

<strong>As of August 2021, Gitcoin Holdings is Hiring Engineers</strong> -- Say hi in the #decentralize-gitcoin channel on the [Gitcoin Discord](https://gitcoin.co/discord) to get involve

