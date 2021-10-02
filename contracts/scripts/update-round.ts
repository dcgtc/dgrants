import fs from 'fs';
import hre from 'hardhat';
import { createIpfs } from '@dgrants/utils/src/ipfs';
import { ScriptLogger } from './ScriptLogger';
import params from './config/update-round.config';

const { ethers } = hre;

const ipfs = createIpfs(process.env.FLEEK_STORAGE_API_KEY!); // eslint-disable-line @typescript-eslint/no-non-null-assertion

// IIFE async function so "await"s can be performed for each operation
(async function () {
  const network = hre.network.name;

  const logger = new ScriptLogger('update-round', network);

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

    // Confirm deployer matches metadataAdmin for round, otherwise tx will fail
    const round = await ethers.getContractAt('GrantRound', networkParams.roundAddress);
    const roundAdmin = await round.metadataAdmin();

    if (deployer.address !== roundAdmin) {
      throw new Error(`Deployer (${deployer.address}) is not metadataAdmin (${roundAdmin})`);
    }

    // Get confirmation from user before beginning deployment
    await logger.confirmContinue();

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

    // Update the round metaptr
    const metadataPtr = `${networkParams.ipfsRetrievalEndpoint}/${metadataCid}`;
    const updateTx = await round.updateMetadataPtr(metadataPtr);
    await updateTx.wait();
    logger.recordAction('UpdateRoundMetaPtr', updateTx.hash);
  } catch (error) {
    logger.recordAction('Error', error.toString());
  }

  logger.save();
})();
