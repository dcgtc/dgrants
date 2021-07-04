# dcgrants

## Development

This project is a monorepo with three packages:

- `contracts` contains the smart contracts
- `app` is a frontend

### Dependencies

To ensure that everyone is using the same version of nodejs on this project, [volta](https://volta.sh) is recommended!

### Set your env files

Copy **app/.env.template** to **app/.env** and edit, providing your own env vars

Copy **contracts/.env.template** to **contracts/.env** and edit, providing your own env vars

````

### Develop

```sh
yarn
yarn dev
````

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
