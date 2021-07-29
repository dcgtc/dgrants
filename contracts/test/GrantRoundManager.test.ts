// --- External imports ---
import { artifacts, ethers, waffle } from 'hardhat';
import { Artifact } from 'hardhat/types';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address';
import { deployMockContract } from '@ethereum-waffle/mock-contract';
import { MockContract } from 'ethereum-waffle';
import { expect } from 'chai';

// --- Our imports ---
import { ETH_ADDRESS, UNISWAP_FEES } from './utils';
import { GrantRoundManager } from '../typechain';
import { Donation } from '@dgrants/types';

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
    await mockRegistry.mock.grantCount.returns('1');
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

  describe('createGrantRound', () => {
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

  describe.only('swapAndDonate', () => {
    let mockRound: MockContract;
    let donation: Donation;
    const farTimestamp = '10000000000'; // date of 2286-11-20

    beforeEach(async () => {
      // Deploy a mock GrantRound
      mockRound = await deployMockContract(user, artifacts.readArtifactSync('GrantRound').abi);
      await mockRound.mock.donationToken.returns(mockToken.address);
      await mockRound.mock.startTime.returns('1');
      await mockRound.mock.endTime.returns(farTimestamp);

      // Configure default donation data
      donation = {
        grantId: 0,
        rounds: [mockRound.address],
        tokenIn: mockToken.address,
        fee: UNISWAP_FEES[0],
        deadline: farTimestamp, // arbitrary date far in the future
        amountIn: '1',
        amountOutMinimum: '0',
        sqrtPriceLimitX96: '0',
      };
    });

    it('reverts if no rounds are specified', async () => {
      await expect(manager.swapAndDonate({ ...donation, rounds: [] })).to.be.revertedWith(
        'GrantRoundManager: Must specify at least one round'
      );
    });

    it('reverts if an invalid grant ID is provided', async () => {
      await expect(manager.swapAndDonate({ ...donation, grantId: '500' })).to.be.revertedWith(
        'GrantRoundManager: Grant does not exist in registry'
      );
    });

    it('reverts if a provided grant round has a different donation token than the GrantRoundManager', async () => {
      await mockRound.mock.donationToken.returns(ETH_ADDRESS);
      await expect(manager.swapAndDonate(donation)).to.be.revertedWith(
        "GrantRoundManager: GrantRound's donation token does not match GrantRoundManager's donation token"
      );
    });

    it('reverts if a provided grant round has not started', async () => {
      await mockRound.mock.startTime.returns(farTimestamp);
      await expect(manager.swapAndDonate(donation)).to.be.revertedWith('GrantRoundManager: GrantRound is not active');
    });

    it('reverts if a provided grant round has already ended', async () => {
      await mockRound.mock.endTime.returns('1');
      await expect(manager.swapAndDonate(donation)).to.be.revertedWith('GrantRoundManager: GrantRound is not active');
    });

    it('if input token equals donation token, it transfers funds directly to grant payee');
    it('if input token does not equal donation token, it swaps funds to grant payee');
    it('emits a log on a successful donation');
  });
});
