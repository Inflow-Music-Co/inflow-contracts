# <h1 align="center"> inflow </h1>

![GitHub Actions](https://github.com/aegis-studio-dev/inflow/actions/workflows/node.js.yml/badge.svg)

### Install Dependencies

```sh
yarn install
```

### Compile

1. Deletes hardhat cache and contract artifacts
2. Compiles contracts

```sh
yarn compile
```

### Coverage

1. Generates the code coverage report

```sh
yarn coverage
```

### Prettier

1. Automatically formats Solidity code

```sh
yarn prettier
```

### Test

1. Runs mocha unit tests

```sh
yarn test
```

### TypeChain

1. Generates Smart Contract TypeScript bindings

```sh
yarn typechain
```

### Deployments 
```
Rinkby MockUSDC Minter : 0x63aF7615e795F2cFb8A2f93aFAd7CD1B4d35bA5c
Rinkby SocialTokenFactory : 0x0075c7aaa1D50857Dd5d293590d105f378A6f5Ff
Rinkby Example Artist wallet Address : 0x1362133CC1c49f4dEcddCAE3e8fBD7b72F17106f (use for getToken)
```
### Deployer Account (admin)
```
0x16808b32761e4c3fc68d2ceae2f9b54bf59326cc
```


### Mint MockUSDC

```sh
yarn mint
```
