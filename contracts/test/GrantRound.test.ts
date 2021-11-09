// --- External imports ---
import { artifacts, ethers, waffle } from 'hardhat';
import { Artifact } from 'hardhat/types';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address';
import { expect } from 'chai';

// --- Our imports ---
import { GrantRegistry } from '../typechain/GrantRegistry';
import { MockToken } from '../typechain/MockToken';
import { timeTravel, setNextBlockTimestamp } from './utils';

import { ContractFactory } from 'ethers';

// --- Parse and define helpers ---
const { loadFixture, deployContract } = waffle;
const { MaxUint256 } = ethers.constants;
const { isAddress } = ethers.utils;

describe('GrantRound', function () {
  const mockMetaPtr = { protocol: 1, pointer: 'QmPMERYmqZtbHmqd2UzRhX9F4cixnMQU2GFa2hYAsQ6J3D' }; // dummy data
  let deployer: SignerWithAddress,
    payoutAdmin: SignerWithAddress,
    donor: SignerWithAddress,
    grantPayee: SignerWithAddress,
    mpUser: SignerWithAddress; // matching pool user
  let registry: GrantRegistry;
  const defaultTokenSupply = '2000';
  const donorAmount = '100';
  let roundContractFactory: ContractFactory;
  let startTime = Math.floor(new Date().getTime() / 1000); // time in seconds
  let endTime: number; // One day

  async function deployGrantRound(
    matchingTokenSupply: string,
    donationTokenSupply: string,
    newStartTime?: number,
    newEndTime?: number
  ) {
    [deployer, payoutAdmin, donor, grantPayee, mpUser] = await ethers.getSigners();
    const mockTokenArtifact: Artifact = await artifacts.readArtifact('MockToken');
    const mockDonationERC20 = <MockToken>(
      await deployContract(deployer, mockTokenArtifact, [ethers.utils.parseEther(donationTokenSupply)])
    );

    const mockMatchingERC20 = <MockToken>(
      await deployContract(deployer, mockTokenArtifact, [ethers.utils.parseEther(matchingTokenSupply)])
    );

    const grantRegistryArtifact: Artifact = await artifacts.readArtifact('GrantRegistry');
    registry = <GrantRegistry>await deployContract(deployer, grantRegistryArtifact);

    // Create an example grant
    await registry.connect(deployer).createGrant(deployer.address, grantPayee.address, mockMetaPtr);

    const grantRoundArtifact: Artifact = await artifacts.readArtifact('GrantRound');
    roundContractFactory = new ethers.ContractFactory(grantRoundArtifact.abi, grantRoundArtifact.bytecode, deployer);

    startTime = newStartTime ? newStartTime : await setNextBlockTimestamp(startTime + 200);
    endTime = newEndTime ? newEndTime : startTime + 86400; // One day

    const roundContract = await roundContractFactory.deploy(
      deployer.address,
      payoutAdmin.address,
      registry.address,
      mockDonationERC20.address,
      mockMatchingERC20.address,
      startTime,
      endTime,
      mockMetaPtr
    );

    return { mockMatchingERC20, mockDonationERC20, roundContract };
  }

  async function setup() {
    const { mockMatchingERC20, mockDonationERC20, roundContract } = await deployGrantRound(
      defaultTokenSupply,
      defaultTokenSupply
    );

    // Seed funds for matching pool user
    await mockMatchingERC20.transfer(mpUser.address, ethers.utils.parseEther(donorAmount));
    // Seed funds for initial donor
    await mockDonationERC20.transfer(donor.address, ethers.utils.parseEther(donorAmount));
    await mockMatchingERC20.connect(mpUser).approve(roundContract.address, MaxUint256);

    await mockDonationERC20.connect(donor).approve(roundContract.address, MaxUint256);
    await mockDonationERC20.connect(payoutAdmin).approve(roundContract.address, MaxUint256);

    return { mockMatchingERC20, mockDonationERC20, roundContract };
  }

  describe('Initialization', () => {
    it('deploys properly', async function () {
      const { roundContract } = await loadFixture(setup);
      expect(isAddress(roundContract.address), 'Failed to deploy GrantRegistry').to.be.true;
    });

    it('reverts if donation token supply is zero', async function () {
      await expect(deployGrantRound(defaultTokenSupply, '0')).to.be.revertedWith('GrantRound: Invalid donation token');
    });

    it('reverts if matching token supply is zero', async function () {
      await expect(deployGrantRound('0', defaultTokenSupply)).to.be.revertedWith('GrantRound: Invalid matching token');
    });

    it('reverts if start time is invalid', async function () {
      await expect(deployGrantRound(defaultTokenSupply, defaultTokenSupply, startTime)).to.be.revertedWith(
        'GrantRound: Start time has already passed'
      );
    });

    it('reverts if end time is invalid', async function () {
      await expect(deployGrantRound(defaultTokenSupply, defaultTokenSupply, undefined, startTime)).to.be.revertedWith(
        'GrantRound: End time must be after start time'
      );
    });

    it('reverts deployment if grant registry is invalid', async function () {
      const [deployer, payoutAdmin] = await ethers.getSigners();
      const mockTokenArtifact: Artifact = await artifacts.readArtifact('MockToken');
      const mockERC20 = <MockToken>(
        await deployContract(deployer, mockTokenArtifact, [ethers.utils.parseEther(defaultTokenSupply)])
      );

      const grantRoundArtifact: Artifact = await artifacts.readArtifact('GrantRound');
      roundContractFactory = new ethers.ContractFactory(grantRoundArtifact.abi, grantRoundArtifact.bytecode, deployer);

      startTime = await setNextBlockTimestamp(startTime + 200);
      endTime = startTime + 86400; // One day

      await expect(
        roundContractFactory.deploy(
          deployer.address,
          payoutAdmin.address,
          // send an EOA instead of a grant registry contract
          deployer.address,
          mockERC20.address,
          startTime,
          endTime,
          mockMetaPtr
        )
      ).to.be.reverted;
    });
  });

  describe('addMatchingFunds - Add funds to matching round', () => {
    it('updates contract and user balances and emits an event', async function () {
      const { mockMatchingERC20, roundContract } = await loadFixture(setup);
      const amt = ethers.utils.parseEther(donorAmount);
      await expect(roundContract.connect(mpUser).addMatchingFunds(amt))
        .to.emit(roundContract, 'AddMatchingFunds')
        .withArgs(amt, mpUser.address);
      expect(await mockMatchingERC20.balanceOf(roundContract.address)).to.be.equal(amt);
    });
  });

  describe('payoutGrants - payout remaining contract balance to a given address', () => {
    it('reverts if round has not ended', async function () {
      const { roundContract } = await loadFixture(setup);
      await expect(roundContract.connect(payoutAdmin).payoutGrants(deployer.address)).to.be.revertedWith(
        'Method must be called after round has ended'
      );
    });
  });

  describe('updateMetadataPtr - updates metadata pointer string', () => {
    it('updates the pointer and emits an event', async function () {
      const { roundContract } = await loadFixture(setup);
      const newPtr = { protocol: 1, pointer: 'QmPMERYmqZtbHmqd2UzRhX9F4cixnMQU2GFa2hYAsQ6J3D' }; // dummy data
      const oldPtr = await roundContract.metaPtr();

      await expect(roundContract.connect(deployer).updateMetadataPtr(newPtr))
        .to.emit(roundContract, 'MetadataUpdated')
        .withArgs([oldPtr.protocol, oldPtr.pointer], [newPtr.protocol, oldPtr.pointer]);
    });

    it('reverts if not the grant round metadata admin', async function () {
      const { roundContract } = await loadFixture(setup);
      await expect(roundContract.connect(mpUser).updateMetadataPtr({ protocol: 1, pointer: 'x' })).to.be.revertedWith(
        'GrantRound: Action can be performed only by metadataAdmin'
      );
    });
  });

  describe('Round end corner cases', () => {
    it('sends remaining matching pool funds to payout address and emits an event', async function () {
      const { mockMatchingERC20, roundContract } = await loadFixture(setup);
      const amt = ethers.utils.parseEther(donorAmount);

      await roundContract.connect(mpUser).addMatchingFunds(amt);
      await timeTravel(endTime + 1);
      await expect(roundContract.connect(payoutAdmin).payoutGrants(grantPayee.address))
        .to.emit(roundContract, 'PaidOutGrants')
        .withArgs(amt);
      expect(await mockMatchingERC20.balanceOf(grantPayee.address)).to.be.equal(amt);
    });

    it('reverts if not the grant round payout administrator', async function () {
      const { roundContract } = await loadFixture(setup);
      await timeTravel(endTime + 1);
      await expect(roundContract.connect(mpUser).payoutGrants(deployer.address)).to.be.revertedWith(
        'GrantRound: Only the payout administrator can call this method'
      );
    });

    it('matching pool transfers revert if passed round end time', async function () {
      const { roundContract } = await loadFixture(setup);
      await timeTravel(endTime + 1);
      await expect(roundContract.connect(mpUser).addMatchingFunds(donorAmount)).to.be.revertedWith(
        'GrantRound: Method must be called before round has ended'
      );
    });
  });
});
