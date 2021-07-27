// --- External imports ---
import { artifacts, ethers, waffle } from 'hardhat';
import { Artifact } from 'hardhat/types';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address';
import { deployMockContract } from '@ethereum-waffle/mock-contract';
import { MockContract } from 'ethereum-waffle';
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
  let mockToken: MockContract;

  before(async () => {
    [user] = await ethers.getSigners();
    mockToken = await deployMockContract(user, ['function totalSupply() returns(uint256)']);
    await mockToken.mock.totalSupply.returns('1');

    // Deploy Manager
    const managerArtifact: Artifact = await artifacts.readArtifact('GrantRoundManager');
    manager = <GrantRoundManager>await deployContract(user, managerArtifact, [mockToken.address]);
  });

  it('deploys properly', async () => {
    expect(isAddress(manager.address), 'Failed to deploy GrantRoundManager').to.be.true;
  });

  it('reverts when deploying with an invalid donation token', async () => {
    // First we test a donation token address that has no code
    const managerArtifact: Artifact = await artifacts.readArtifact('GrantRoundManager');
    await expect(deployContract(user, managerArtifact, [randomAddress()])).to.be.revertedWith(
      'function call to a non-contract account'
    );

    // Now we test a donation token that has no supply
    await mockToken.mock.totalSupply.returns('0');
    await expect(deployContract(user, managerArtifact, [mockToken.address])).to.be.revertedWith(
      'GrantRoundManager: Invalid token'
    );
  });

  it('creates new grant rounds', async () => {
    // Deploy and configure mocks (used to pass the validation in the GrantRound constructor)
    const mockRegistry = await deployMockContract(user, ['function grantCount() returns(uint96)']);
    await mockRegistry.mock.grantCount.returns('0');

    // Create round
    const metadataAdmin = randomAddress();
    const payoutAdmin = randomAddress();
    const registry = mockRegistry.address;
    const startTime = '50000000000000'; // random timestamp far in the future
    const endTime = '60000000000000'; // random timestamp far in the future
    const metaPtr = 'https://metadata-pointer.com';
    const minContribution = '100';
    const tx = await manager.createGrantRound(
      metadataAdmin,
      payoutAdmin,
      registry,
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
    expect(await grantRound.donationToken()).to.equal(mockToken.address);
    expect(await grantRound.startTime()).to.equal(startTime);
    expect(await grantRound.endTime()).to.equal(endTime);
    expect(await grantRound.metaPtr()).to.equal(metaPtr);
    expect(await grantRound.minContribution()).to.equal(minContribution);
  });
});
