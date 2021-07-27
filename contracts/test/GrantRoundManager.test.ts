// --- External imports ---
import { artifacts, ethers, waffle } from 'hardhat';
import { Artifact } from 'hardhat/types';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address';
import { deployMockContract } from '@ethereum-waffle/mock-contract';
import { expect } from 'chai';

// --- Our imports ---
import { GrantRoundManager } from '../typechain';

// --- Parse and define helpers ---
const { isAddress } = ethers.utils;
const { deployContract } = waffle;
const randomAddress = () => ethers.Wallet.createRandom().address;

// --- GrantRoundManager tests ---
describe('GrantRoundManager', () => {
  let user: SignerWithAddress;
  let manager: GrantRoundManager;

  before(async () => {
    [user] = await ethers.getSigners();

    // Deploy Manager
    const managerArtifact: Artifact = await artifacts.readArtifact('GrantRoundManager');
    manager = <GrantRoundManager>await deployContract(user, managerArtifact);
  });

  it('deploys properly', async () => {
    expect(isAddress(manager.address), 'Failed to deploy GrantRoundManager').to.be.true;
  });

  it('creates new grant rounds', async () => {
    // Deploy and configure mocks (used to pass the validation in the GrantRound constructor)
    const mockRegistry = await deployMockContract(user, ['function grantCount() returns(uint96)']);
    await mockRegistry.mock.grantCount.returns('0');
    const mockToken = await deployMockContract(user, ['function totalSupply() returns(uint256)']);
    await mockToken.mock.totalSupply.returns('1');

    // Create round
    const metadataAdmin = randomAddress();
    const payoutAdmin = randomAddress();
    const registry = mockRegistry.address;
    const token = mockToken.address;
    const startTime = '50000000000000'; // random timestamp far in the future
    const endTime = '60000000000000'; // random timestamp far in the future
    const metaPtr = 'https://metadata-pointer.com';
    const minContribution = '100';
    const tx = await manager.createGrantRound(
      metadataAdmin,
      payoutAdmin,
      registry,
      token,
      startTime,
      endTime,
      metaPtr,
      minContribution
    );

    // Verify event log was emitted
    await expect(tx).to.emit(manager, 'GrantRoundCreated');

    // Parse data from the event to get the address of the new GrantRound
    const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
    const log = manager.interface.parseLog(receipt.logs[0]);
    const { grantRound: grantRoundAddress } = log.args;

    // Verify GrantRound was properly created
    const grantRound = await ethers.getContractAt('GrantRound', grantRoundAddress);
    expect(await grantRound.metadataAdmin()).to.equal(metadataAdmin);
    expect(await grantRound.payoutAdmin()).to.equal(payoutAdmin);
    expect(await grantRound.registry()).to.equal(registry);
    expect(await grantRound.donationToken()).to.equal(token);
    expect(await grantRound.startTime()).to.equal(startTime);
    expect(await grantRound.endTime()).to.equal(endTime);
    expect(await grantRound.metaPtr()).to.equal(metaPtr);
    expect(await grantRound.minContribution()).to.equal(minContribution);
  });
});
