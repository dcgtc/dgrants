// --- External imports ---
import { artifacts, ethers, waffle } from 'hardhat';
import { Artifact } from 'hardhat/types';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address';
import { expect } from 'chai';

// --- Our imports ---
import { GrantRegistry } from '../typechain/GrantRegistry';
import { MockToken } from '../typechain/MockToken';
import { timeTravel, setNextBlockTimestamp } from './utils';

import { Contract } from 'ethers';

// --- Parse and define helpers ---
const { deployContract } = waffle;
const { MaxUint256 } = ethers.constants;
const { isAddress } = ethers.utils;

describe('GrantRound', function () {
  let deployer: SignerWithAddress,
    payoutAdmin: SignerWithAddress,
    donor: SignerWithAddress,
    grantPayee: SignerWithAddress,
    mpUser: SignerWithAddress; // matching pool user
  let registry: GrantRegistry;
  let roundContract: Contract;
  let mockERC20: MockToken;
  const tokenSupply = '2000';
  const donorAmount = '100';
  let startTime = Math.floor(new Date().getTime() / 1000); // time in seconds
  let endTime: number; // One day

  beforeEach(async () => {
    const mockUrl: string = 'https://test.url';
    const minContribution = 50;
    [deployer, payoutAdmin, donor, grantPayee, mpUser] = await ethers.getSigners();
    const mockTokenArtifact: Artifact = await artifacts.readArtifact('MockToken');
    mockERC20 = <MockToken>await deployContract(deployer, mockTokenArtifact, [ethers.utils.parseEther(tokenSupply)]);
    // Seed funds for matching pool user
    await mockERC20.transfer(mpUser.address, ethers.utils.parseEther(donorAmount));
    // Seed funds for initial donor
    await mockERC20.transfer(donor.address, ethers.utils.parseEther(donorAmount));

    const grantRegistryArtifact: Artifact = await artifacts.readArtifact('GrantRegistry');
    registry = <GrantRegistry>await deployContract(deployer, grantRegistryArtifact);

    // Create an example grant
    await registry.connect(deployer).createGrant(deployer.address, grantPayee.address, mockUrl);

    const grantRoundArtifact: Artifact = await artifacts.readArtifact('GrantRound');
    const roundContractFactory = new ethers.ContractFactory(
      grantRoundArtifact.abi,
      grantRoundArtifact.bytecode,
      deployer
    );

    startTime = await setNextBlockTimestamp(deployer.provider, startTime, 200);
    endTime = startTime + 86400; // One day

    roundContract = await roundContractFactory.deploy(
      deployer.address,
      payoutAdmin.address,
      registry.address,
      mockERC20.address,
      startTime,
      endTime,
      mockUrl,
      minContribution
    );

    await mockERC20.connect(mpUser).approve(roundContract.address, MaxUint256);
    await mockERC20.connect(donor).approve(roundContract.address, MaxUint256);
    await mockERC20.connect(payoutAdmin).approve(roundContract.address, MaxUint256);
  });

  describe('Initialization', () => {
    it('deploys properly', async function () {
      expect(isAddress(roundContract.address), 'Failed to deploy GrantRegistry').to.be.true;
    });
  });

  describe('addMatchingFunds - Add funds to matching round', () => {
    it('updates contract and user balances', async function () {
      await roundContract.connect(mpUser).addMatchingFunds(ethers.utils.parseEther(donorAmount));
      expect(await mockERC20.balanceOf(roundContract.address)).to.be.equal(ethers.utils.parseEther(donorAmount));
    });
  });

  describe('donateToGrant - Add funds during active round', () => {
    it('sends donation token to the grant payee with a given grant id', async function () {
      const grantId = 0;

      await roundContract.connect(donor).donateToGrant(ethers.utils.parseEther(donorAmount), grantId);
      expect(await mockERC20.balanceOf(grantPayee.address)).to.be.equal(ethers.utils.parseEther(donorAmount));
    });

    it('emits an event when successful', async function () {
      const grantId = 0;

      await expect(roundContract.connect(donor).donateToGrant(donorAmount, grantId))
        .to.emit(roundContract, 'DonationSent')
        .withArgs(grantId, mockERC20.address, donorAmount, donor.address);
    });

    it('donations revert if not above minimum contribution', async function () {
      const grantId = 0;

      await expect(roundContract.connect(donor).donateToGrant(10, grantId)).to.be.revertedWith(
        'Donation must be greater than minimum contribution'
      );
    });
  });

  describe('payoutGrants - payout remaining contract balance to a given address', () => {
    it('reverts if round has not ended', async function () {
      await expect(roundContract.connect(payoutAdmin).payoutGrants(deployer.address)).to.be.revertedWith(
        'Method must be called after round has ended'
      );
    });
  });

  describe('updateMetadataPtr - updates metadata pointer string', () => {
    it('updates the pointer and emits an event', async function () {
      const newPtr = 'https://new.com';
      const oldPtr = await roundContract.metaPtr();

      await expect(roundContract.connect(deployer).updateMetadataPtr(newPtr))
        .to.emit(roundContract, 'MetadataUpdated')
        .withArgs(oldPtr, newPtr);
    });

    it('reverts if not the grant round metadata admin', async function () {
      await expect(roundContract.connect(mpUser).updateMetadataPtr('test')).to.be.revertedWith(
        'GrantRound: Action can be perfomed only by metadataAdmin'
      );
    });
  });

  describe('Round end corner cases', () => {
    it('sends remaining matching pool funds to payout address', async function () {
      await roundContract.connect(mpUser).addMatchingFunds(ethers.utils.parseEther(donorAmount));
      await timeTravel(endTime + 1);
      await roundContract.connect(payoutAdmin).payoutGrants(grantPayee.address);
      expect(await mockERC20.balanceOf(grantPayee.address)).to.be.equal(ethers.utils.parseEther(donorAmount));
    });

    it.skip('reverts if not the grant round payout administrator', async function () {
      await expect(roundContract.connect(mpUser).payoutGrants(deployer.address)).to.be.revertedWith(
        'GrantRound: Only the payout administrator can call this method'
      );
    });

    it.skip('matching pool transfers revert if passed round end time', async function () {
      await expect(roundContract.connect(mpUser).addMatchingFunds(donorAmount)).to.be.revertedWith(
        'GrantRound: Action cannot be performed as the round has ended'
      );
    });

    it.skip('donations revert if not during active round', async function () {
      const grantId = 0;

      await expect(roundContract.connect(donor).donateToGrant(donorAmount, grantId)).to.be.revertedWith(
        'Donations must be sent during an active round'
      );
    });
  });
});
