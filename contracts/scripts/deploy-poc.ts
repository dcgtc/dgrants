import hre from 'hardhat';
import { create } from 'ipfs-http-client';
import { ScriptLogger } from './ScriptLogger';
import params from './deploy-poc.config';

const { ethers } = hre;

const ipfs = create({
  url: 'https://ipfs-api.dev.fleek.cool',
  headers: {
    Authorization: `v2 ${process.env.FLEEK_STORAGE_API_KEY}`,
  },
});

// IIFE async function so "await"s can be performed for each operation
(async function () {
  const network = hre.network.name;

  const logger = new ScriptLogger('poc', network);

  try {
    // Read configuration parameters for the current network
    const networkParams = params[network];
    if (!networkParams) {
      throw new Error(`Invalid network ${network}`);
    }
    logger.config = networkParams;

    // Get the deployer address
    const [deployer] = await ethers.getSigners();
    logger.deployer = deployer.address;

    // Get confirmation from user before beginning deployment
    await logger.confirmContinue();

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

    // Upload the Round metadata to IPFS
    const res = await ipfs.add(networkParams.metadataJson);
    const metadataCid = res.cid.toString();
    logger.recordAction('PublishGrantRoundMetadata', metadataCid);

    // Create the GrantRound
    const metadataPtr = `${networkParams.ipfsRetrievalEndpoint}/${metadataCid}`;
    const createGrantRoundTxReceipt = await roundManager.createGrantRound(
      networkParams.metadataAdmin,
      networkParams.payoutAdmin,
      networkParams.matchingToken,
      networkParams.roundStartTime,
      networkParams.roundEndTime,
      metadataPtr,
      networkParams.minContribution
    );
    await createGrantRoundTxReceipt.wait();
    logger.recordAction('CreateGrantGround', createGrantRoundTxReceipt.hash);
  } catch (error) {
    logger.recordAction('Error', error.toString());
  }

  logger.save();
})();
