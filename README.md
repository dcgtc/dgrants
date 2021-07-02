# dcgrants

## Development

This project is a monorepo with three packages:

- `contracts` contains the smart contracts
- `app` is a frontend

### Dependencies

To ensure that everyone is using the same version of nodejs on this project, [volta](https://volta.sh) is recommended!

### Set your env files

```sh
cp app/.env.template app/.env
nano app/.env

cp contracts/.env.template contracts/.env
nano contracts/.env
```

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

### Serve

```sh
yarn build
yarn start
```
