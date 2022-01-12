import '@nomiclabs/hardhat-waffle';
import '@nomiclabs/hardhat-etherscan';
import '@typechain/hardhat';
import 'hardhat-gas-reporter';
import 'solidity-coverage';

import './tasks/accounts';
import './tasks/clean';
import './tasks/execute-payouts';

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
  polygon: 137,
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

// Choose node URL to fork from based on ENV var specifying the
// network name; this var can be defined inline with commands
const forkNetwork = process.env.HARDHAT_FORK_NETWORK as string;
let forkNodeURL: string;

if (forkNetwork === 'polygon') {
  forkNodeURL = 'https://polygon-mainnet.g.alchemy.com/v2/';
} else {
  // default to mainnet
  forkNodeURL = 'https://eth-mainnet.alchemyapi.io/v2/';
}

// Configure dummy private key, so CI doesn't fail due a lack of private key env var, which is only needed for
// contract deployment anyway (i.e. not required for CI)
const dummyPrivateKey = '0x0000000000000000000000000000000000000000000000000000000000000001';
const deployPrivateKey = (process.env.DEPLOY_PRIVATE_KEY as string) || dummyPrivateKey;

function createTestnetConfig(network: keyof typeof chainIds): NetworkUserConfig {
  const url: string = `https://eth-${network}.alchemyapi.io/v2/${alchemyApiKey}`;
  return {
    accounts: [deployPrivateKey],
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
  etherscan: {
    // Your API key for Etherscan/Polygonscan
    // Obtain one at https://etherscan.io/ or https://polygonscan.com
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  networks: {
    hardhat: {
      hardfork: 'london',
      initialBaseFeePerGas: 0, // required for solidity-coverage: https://github.com/sc-forks/solidity-coverage/issues/652#issuecomment-896330136
      forking: {
        url: `${forkNodeURL}${alchemyApiKey}`,
        blockNumber: forkNetwork === 'polygon' ? 22610354 : 22610354,
      },
      accounts: {
        mnemonic,
      },
      chainId: chainIds.hardhat,
    },
    rinkeby: createTestnetConfig('rinkeby'),
    polygon: {
      accounts: [deployPrivateKey],
      chainId: chainIds.polygon,
      url: `https://polygon-mainnet.g.alchemy.com/v2/${alchemyApiKey}`,
    },
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
        runs: 2000, // above this, GrantRoundManager starts to exceed size limit
      },
    },
  },
  typechain: {
    outDir: 'typechain',
    target: 'ethers-v5',
  },
  mocha: {
    timeout: 100000,
  },
};

export default config;
