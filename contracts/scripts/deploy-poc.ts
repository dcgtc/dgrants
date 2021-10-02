import fs from 'fs';
import hre from 'hardhat';
import { createIpfs } from '@dgrants/utils/src/ipfs';
import { ScriptLogger } from './ScriptLogger';
import params from './config/deploy-poc.config';

const { ethers } = hre;

const ipfs = createIpfs(process.env.FLEEK_STORAGE_API_KEY!); // eslint-disable-line @typescript-eslint/no-non-null-assertion

// IIFE async function so "await"s can be performed for each operation
(async function () {
  const network = hre.network.name;
  // Polygon gas price is predictable and often overestimated, so just hardcode a price for simplicity
  const overrides = network === 'polygon' ? { gasPrice: hre.ethers.utils.parseUnits('2', 'gwei') } : {};

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
    const registry = await GrantRegistry.deploy(overrides);
    await registry.deployed();
    logger.recordContract('GrantRegistry', registry.address);

    // Deploy the GrantRoundManager
    const managerArtifact = network === 'polygon' ? 'GrantRoundManagerUniV2' : 'GrantRoundManager';
    const GrantRoundManager = await ethers.getContractFactory(managerArtifact, deployer);
    let roundManager;
    if (network === 'polygon') {
      roundManager = await GrantRoundManager.deploy(registry.address, networkParams.donationToken, overrides);
    } else {
      roundManager = await GrantRoundManager.deploy(
        registry.address,
        networkParams.donationToken,
        networkParams.uniswapFactory,
        networkParams.weth,
        overrides
      );
    }
    await roundManager.deployed();
    logger.recordContract(managerArtifact, roundManager.address);

    // Upload the Round metadata to IPFS (3 steps)
    const metadata = networkParams.metadataJson;

    // 1. Upload the round logo
    const logoFile = await fs.readFileSync(networkParams.roundLogoPath);
    const logoResult = await ipfs.add(logoFile);
    const logoCid = logoResult.cid.toString();
    logger.recordAction('PublishGrantRoundLogo', logoCid);

    // 2. Update the metadata to include the logo metaPtr
    metadata['logoURI'] = `${networkParams.ipfsRetrievalEndpoint}/${logoCid}`;

    // 3. Upload the metadata
    const metadataResult = await ipfs.add(JSON.stringify(metadata));
    const metadataCid = metadataResult.cid.toString();
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
      { gasLimit: 1000000 }
    );
    await createGrantRoundTxReceipt.wait();
    logger.recordAction('CreateGrantGround', createGrantRoundTxReceipt.hash);
  } catch (error) {
    logger.recordAction('Error', error.toString());
  }

  logger.save();
})();
