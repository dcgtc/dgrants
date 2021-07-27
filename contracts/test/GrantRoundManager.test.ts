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
  let mockRegistry: MockContract;
  let mockRouter: MockContract;

  before(async () => {
    [user] = await ethers.getSigners();

    // Deploy mock contracts
    // Registry
    mockRegistry = await deployMockContract(user, ['function grantCount() returns(uint96)']);
    await mockRegistry.mock.grantCount.returns('0');
    // Router (constructor just verifies that code exists, so we don't need to mock a function response)
    mockRouter = await deployMockContract(user, []);
    // Token
    mockToken = await deployMockContract(user, ['function totalSupply() returns(uint256)']);
    await mockToken.mock.totalSupply.returns('1');

    // Deploy Manager
    const managerArtifact: Artifact = await artifacts.readArtifact('GrantRoundManager');
    manager = <GrantRoundManager>(
      await deployContract(user, managerArtifact, [mockRegistry.address, mockRouter.address, mockToken.address])
    );
  });

  describe('Constructor', () => {
    it('deploys properly', async () => {
      // Verify deploy
      expect(isAddress(manager.address), 'Failed to deploy GrantRoundManager').to.be.true;

      // Verify constructor parameters
      expect(await manager.registry()).to.equal(mockRegistry.address);
      expect(await manager.router()).to.equal(mockRouter.address);
      expect(await manager.donationToken()).to.equal(mockToken.address);
    });

    it('reverts when deploying with an invalid grant registry', async () => {
      // Test that deployment fails if provided Registry address has no code
      const managerArtifact: Artifact = await artifacts.readArtifact('GrantRoundManager');
      await expect(
        deployContract(user, managerArtifact, [randomAddress(), mockRouter.address, mockToken.address])
      ).to.be.revertedWith('function call to a non-contract account');
    });

    it('reverts when deploying with an invalid router', async () => {
      // Test that deployment fails if provided Router address has no code
      const managerArtifact: Artifact = await artifacts.readArtifact('GrantRoundManager');
      await expect(
        deployContract(user, managerArtifact, [mockRegistry.address, randomAddress(), mockToken.address])
      ).to.be.revertedWith('GrantRoundManager: Invalid router');
    });

    it('reverts when deploying with an invalid donation token', async () => {
      // First we test a donation token address that has no code
      const managerArtifact: Artifact = await artifacts.readArtifact('GrantRoundManager');
      await expect(
        deployContract(user, managerArtifact, [mockRegistry.address, mockRouter.address, randomAddress()])
      ).to.be.revertedWith('function call to a non-contract account');

      // Now we test a donation token that has no supply
      await mockToken.mock.totalSupply.returns('0');
      await expect(
        deployContract(user, managerArtifact, [mockRegistry.address, mockRouter.address, mockToken.address])
      ).to.be.revertedWith('GrantRoundManager: Invalid token');
    });
  });

  describe('Functionality', () => {
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
});
