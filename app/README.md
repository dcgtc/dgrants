# Ethereum App Template

Ethereum frontend app template with the following features:

- [Vue 3](https://v3.vuejs.org/) as the foundation
- [Tailwind CSS](https://tailwindcss.com) for styling
- [Nightwind](https://github.com/jjranalli/nightwind) for easy dark mode support
- [Ethers](https://docs.ethers.io/v5/single-page/) for interacting with Ethereum
- [Vite](https://vitejs.dev/) for 10x-100x faster builds
- [Onboard](https://docs.blocknative.com/onboard) for connecting wallets
- [Multicall2](https://github.com/makerdao/multicall) for polling for data each block

## Setup

```sh
# Install packages
yarn install

# Run in development mode
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

## Notes / Customization

Notes on customizing this app:

- Primary and secondary theme colors are defined in `tailwind.config.js`. Other colors are inlined as classes, e.g. `text-gray-400`.
- Dark mode is handled with [Nightwind](https://github.com/jjranalli/nightwind), which is a Tailwind CSS plugin that generates a dark theme by automatically inverting color classes. The resulting dark mode will not look as a good as a fully customized/hand-crafted dark mode, but this is much less work to implement, and Nightwind does offer some control over the output
- Vite does not use `process.env.MY_VARIABLE` for environment variables, but instead uses `import.meta.env.VITE_MY_VARIABLE`. Values in `.env` that are prefixed with `VITE_` are automatically included. Update the type definitions in `src/shims.d.ts` for any new environment variables
- The Vue router is configured to use `history` mode and assumes the app is hosted at the domain root. Both of these defaults can be changed in `src/router/index.ts`
- Blocknative's [onboard.js](https://docs.blocknative.com/onboard) is used for connecting wallets. Like Vue 3, Vite does not automatically polyfill defaults like `os`, `http`, and `crypto` that are needed by onboard.js, so we `require` this in `vite.config.ts`
- The store modules live in `src/store`, and there are three setup by default
  - `wallet.ts` manages the user's wallet connection
  - `data.ts` atomically polls for data each block using `Multicall2`
  - `settings.ts` saves and manages user settings such as dark mode and wallet selection
