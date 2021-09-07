/**
 * @dev Gas snapshotting tests
 * source: https://gist.github.com/gakonst/258a6ccd6bb752248999a13e8dd82a64
 */

// --- External imports ---
import { artifacts, ethers, waffle } from 'hardhat';
import { Artifact } from 'hardhat/types';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address';

// --- Our imports ---
import { snapshotGasCost } from './snapshotGasCost';
import { GrantRegistry } from '../typechain';

// --- Parse and define helpers ---
const { deployContract } = waffle;
const address = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'; // hardhat account 0, but can be any address
const metaPtr = 'https://ipfs-dev.fleek.co/ipfs/QmaHTgor7GhetW3nmev3UqabjrzbKJCe7q1v8Wfg3aZyV4';

// --- Gas tests ---
describe('dGrants gas tests', () => {
  let deployer: SignerWithAddress;
  let registry: GrantRegistry;

  beforeEach(async () => {
    [deployer] = await ethers.getSigners();

    const grantRegistryArtifact: Artifact = await artifacts.readArtifact('GrantRegistry');
    registry = <GrantRegistry>await deployContract(deployer, grantRegistryArtifact);
  });

  describe('GrantRegistry', () => {
    it('createGrant', async () => {
      await snapshotGasCost(registry.createGrant(address, address, metaPtr));
    });
  });
});
