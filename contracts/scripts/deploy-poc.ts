import hre from 'hardhat';
import { ScriptLogger } from './ScriptLogger';
import params from './deploy-poc.config';

const { ethers } = hre;

// IIFE async function so "await"s can be performed for each operation
(async function () {
  const network = hre.network.name;
  console.log(`Deploying to ${network}`);

  const logger = new ScriptLogger(network);

  try {
    // Read configuration parameters for the current network
    const networkParams = params[network];
    if (!networkParams) {
      throw new Error(`Invalid network ${network}`);
    }
    logger.config = networkParams;

    // Get the deployer address
    const [deployer] = await ethers.getSigners();
    console.log(`Deployer: ${deployer.address}`);
    logger.deployer = deployer.address;

    // Deploy the GrantRegistry
    const GrantRegistry = await ethers.getContractFactory('GrantRegistry', deployer);
    const registry = await GrantRegistry.deploy();
    await registry.deployed();
    logger.recordContract('GrantRegistry', registry.address);

    // Deploy the GrantRoundManager
    const GrantRoundManager = await ethers.getContractFactory('GrantRoundManager', deployer);
    const roundManager = await GrantRoundManager.deploy(
      registry.address,
      networkParams.donationToken,
      networkParams.uniswapFactory,
      networkParams.weth
    );
    await roundManager.deployed();
    logger.recordContract('GrantRoundManager', roundManager.address);

    // Create the GrantRound
    const createGrantRoundTxReceipt = await roundManager.createGrantRound(
      networkParams.metadataAdmin,
      networkParams.payoutAdmin,
      networkParams.matchingToken,
      registry.address, // TODO: evaluate why we're passing this at all
      networkParams.roundStartTime,
      networkParams.roundEndTime,
      'https://placeholder.for.metaptr',
      networkParams.minContribution
    );
    await createGrantRoundTxReceipt.wait();
    logger.recordAction('CreateGrantGround', createGrantRoundTxReceipt.hash);
  } catch (error) {
    logger.recordAction('Error', error.toString());
  }

  logger.save();
})();
