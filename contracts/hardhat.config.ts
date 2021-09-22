import '@nomiclabs/hardhat-waffle';
import '@typechain/hardhat';
import 'hardhat-gas-reporter';
import 'solidity-coverage';

import './tasks/accounts';
import './tasks/clean';

import { resolve } from 'path';

import { config as dotenvConfig } from 'dotenv';
import { HardhatUserConfig } from 'hardhat/config';
import { NetworkUserConfig } from 'hardhat/types';

dotenvConfig({ path: resolve(__dirname, './.env') });

const chainIds = {
  ganache: 1337,
  goerli: 5,
  hardhat: 31337,
  kovan: 42,
  mainnet: 1,
  rinkeby: 4,
  ropsten: 3,
};

// Ensure that we have all the environment variables we need.
let mnemonic = process.env.MNEMONIC as string;
if (!mnemonic) {
  console.warn('Please set your MNEMONIC in a .env file');
  mnemonic = 'test test test test test test test test test test test junk';
}

let alchemyApiKey = process.env.ALCHEMY_API_KEY as string;
if (!alchemyApiKey) {
  console.warn('Please set your ALCHEMY_API_KEY in a .env file');
  alchemyApiKey = '00000000000000000000000000000000';
}

function createTestnetConfig(network: keyof typeof chainIds): NetworkUserConfig {
  const url: string = `https://eth-${network}.alchemyapi.io/v2/${alchemyApiKey}`;
  const dummyPrivateKey = '0x0000000000000000000000000000000000000000000000000000000000000001';
  return {
    accounts: [(process.env.DEPLOY_PRIVATE_KEY as string) || dummyPrivateKey],
    chainId: chainIds[network],
    allowUnlimitedContractSize: true,
    url,
  };
}

const config: HardhatUserConfig = {
  defaultNetwork: 'hardhat',
  gasReporter: {
    currency: 'USD',
    enabled: process.env.REPORT_GAS ? true : false,
    excludeContracts: [],
    src: './contracts',
  },
  networks: {
    hardhat: {
      hardfork: 'london',
      initialBaseFeePerGas: 0, // required for solidity-coverage: https://github.com/sc-forks/solidity-coverage/issues/652#issuecomment-896330136
      forking: {
        url: `https://eth-mainnet.alchemyapi.io/v2/${alchemyApiKey}`,
        blockNumber: 13186295, // mainnet block, but works fine for Polygon too
      },
      accounts: {
        mnemonic,
      },
      chainId: chainIds.hardhat,
    },
    rinkeby: createTestnetConfig('rinkeby'),
  },
  paths: {
    artifacts: './artifacts',
    cache: './cache',
    sources: './contracts',
    tests: './test',
  },
  solidity: {
    version: '0.7.6',
    settings: {
      metadata: {
        // Not including the metadata hash
        // https://github.com/paulrberg/solidity-template/issues/31
        bytecodeHash: 'none',
      },
      // You should disable the optimizer when debugging
      // https://hardhat.org/hardhat-network/#solidity-optimizer-support
      optimizer: {
        enabled: true,
        runs: 25000, // above this, GrantRoundManager starts to exceed size limit
      },
    },
  },
  typechain: {
    outDir: 'typechain',
    target: 'ethers-v5',
  },
};

export default config;
