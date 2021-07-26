// --- External imports ---
import { artifacts, ethers, waffle } from 'hardhat';
import { Artifact } from 'hardhat/types';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address';
import { expect } from 'chai';

// --- Our imports ---
import { GrantRegistry } from '../typechain/GrantRegistry';
import { timeTravel } from './utils';
import IERC20Artifact from '../artifacts/@openzeppelin/contracts/token/ERC20/IERC20.sol/IERC20.json';

// --- Parse and define helpers ---
const { deployContract, deployMockContract } = waffle;
const { isAddress } = ethers.utils;

describe('GrantRound', function () {
  let deployer: SignerWithAddress,
    payoutAdmin: SignerWithAddress,
    donor: SignerWithAddress,
    grantPayee: SignerWithAddress,
    mpUser: SignerWithAddress; // matching pool user
  let registry: GrantRegistry;
  let roundContract: any;
  let mockERC20: any;
  const balances: string[] = ['100', '200'];
  const startTime = Math.floor(new Date().getTime() / 1000); // time in seconds
  const endTime = startTime + 86400; // One day

  beforeEach(async () => {
    const mockUrl: string = 'https://test.url';
    const minContribution = 50;
    [deployer, payoutAdmin, donor, grantPayee, mpUser] = await ethers.getSigners();
    mockERC20 = await deployMockContract(deployer, IERC20Artifact.abi);
    // Seed funds for matching pool user
    await mockERC20.mock.transfer.withArgs(mpUser.address, ethers.utils.parseEther(balances[0])).returns(true);
    // Seed funds for initial donor
    await mockERC20.mock.transfer.withArgs(donor.address, ethers.utils.parseEther(balances[0])).returns(true);

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
  });

  describe('Initialization', () => {
    it('deploys properly', async function () {
      expect(isAddress(roundContract.address), 'Failed to deploy GrantRegistry').to.be.true;
    });
  });

  describe('addMatchingFunds - Add funds to matching round', () => {
    it('updates contract and user balances', async function () {
      // set up mock calls
      await mockERC20.mock.balanceOf.withArgs(mpUser.address).returns(ethers.utils.parseEther(balances[0]));
      await mockERC20.mock.balanceOf.withArgs(roundContract.address).returns(ethers.utils.parseEther(balances[0]));
      await mockERC20.mock.transferFrom.withArgs(mpUser.address, roundContract.address, balances[0]).returns(true);

      await roundContract.connect(mpUser).addMatchingFunds(balances[0]);
      // TODO: add token.balanceOf check in mock ERC20
    });
  });

  describe('donateToGrant - Add funds during active round', () => {
    it('sends donation token to the grant payee with a given grant id', async function () {
      const grantId = 0;
      await mockERC20.mock.balanceOf.withArgs(donor.address).returns(ethers.utils.parseEther(balances[0]));
      await mockERC20.mock.balanceOf.withArgs(grantPayee.address).returns(ethers.utils.parseEther(balances[0]));
      await mockERC20.mock.transferFrom.withArgs(donor.address, grantPayee.address, balances[0]).returns(true);

      await roundContract.connect(donor).donateToGrant(balances[0], grantId);
      // TODO: add token.balanceOf check in mock ERC20
    });

    it('emits an event when successful', async function () {
      const grantId = 0;
      await mockERC20.mock.balanceOf.withArgs(donor.address).returns(ethers.utils.parseEther(balances[0]));
      await mockERC20.mock.balanceOf.withArgs(grantPayee.address).returns(ethers.utils.parseEther(balances[0]));
      await mockERC20.mock.transferFrom.withArgs(donor.address, grantPayee.address, balances[0]).returns(true);

      await expect(roundContract.connect(donor).donateToGrant(balances[0], grantId))
        .to.emit(roundContract, 'DonationSent')
        .withArgs(grantId, mockERC20.address, balances[0], donor.address);
    });

    it('donations revert if not above minimum contribution', async function () {
      const grantId = 0;
      await mockERC20.mock.balanceOf.withArgs(donor.address).returns(ethers.utils.parseEther(balances[0]));
      await mockERC20.mock.balanceOf.withArgs(grantPayee.address).returns(ethers.utils.parseEther(balances[0]));
      await mockERC20.mock.transfer.withArgs(grantPayee.address, balances[0]).returns(true);

      await expect(roundContract.connect(donor).donateToGrant(10, grantId)).to.be.revertedWith(
        'Donation amount must be greater than minimum contribution'
      );
    });
  });

  describe('payoutGrants - payout remaining contract balance to a given address', () => {
    it('reverts if round has not ended', async function () {
      await mockERC20.mock.balanceOf.withArgs(deployer.address).returns(ethers.utils.parseEther(balances[0]));
      await mockERC20.mock.balanceOf.withArgs(roundContract.address).returns(ethers.utils.parseEther(balances[0]));
      await mockERC20.mock.transfer.withArgs(deployer.address, balances[0]).returns(true);

      await expect(roundContract.connect(payoutAdmin).payoutGrants(deployer.address)).to.be.revertedWith(
        'Method must be called after the active round has ended'
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
        'GrantRound: Only the grant round metadata admin can update the metadata pointer'
      );
    });
  });

  describe('Round end corner cases', () => {
    before(async () => {
      // End the round for all subsequent tests
      await timeTravel(deployer.provider, endTime + 1);
    });

    it.skip('sends remaining matching pool funds to payout address', async function () {
      await mockERC20.mock.balanceOf.withArgs(grantPayee.address).returns(ethers.utils.parseEther(balances[0]));
      await mockERC20.mock.balanceOf.withArgs(roundContract.address).returns(ethers.utils.parseEther(balances[0]));
      await mockERC20.mock.transfer.withArgs(grantPayee.address, balances[0]).returns(true);

      await roundContract.connect(payoutAdmin).payoutGrants(grantPayee.address);

      // TODO: add token.balanceOf check in mock ERC20
    });

    it('reverts if not the grant round payout administrator', async function () {
      await mockERC20.mock.balanceOf.withArgs(deployer.address).returns(ethers.utils.parseEther(balances[0]));
      await mockERC20.mock.balanceOf.withArgs(roundContract.address).returns(ethers.utils.parseEther(balances[0]));
      await mockERC20.mock.transfer.withArgs(deployer.address, balances[0]).returns(true);

      await expect(roundContract.connect(mpUser).payoutGrants(deployer.address)).to.be.revertedWith(
        'GrantRound: Only the payout administrator can call this method'
      );
    });

    it('matching pool transfers revert if passed round end time', async function () {
      await mockERC20.mock.balanceOf.withArgs(mpUser.address).returns(ethers.utils.parseEther(balances[0]));
      await mockERC20.mock.balanceOf.withArgs(roundContract.address).returns(ethers.utils.parseEther(balances[0]));
      await mockERC20.mock.transferFrom.withArgs(mpUser.address, roundContract.address, balances[0]).returns(true);

      await expect(roundContract.connect(mpUser).addMatchingFunds(balances[0])).to.be.revertedWith(
        'GrantRound: Action cannot be performed as the round has ended'
      );
    });

    it('donations revert if not during active round', async function () {
      const grantId = 0;
      await mockERC20.mock.balanceOf.withArgs(donor.address).returns(ethers.utils.parseEther(balances[0]));
      await mockERC20.mock.balanceOf.withArgs(grantPayee.address).returns(ethers.utils.parseEther(balances[0]));
      await mockERC20.mock.transfer.withArgs(grantPayee.address, balances[0]).returns(true);

      await expect(roundContract.connect(donor).donateToGrant(balances[0], grantId)).to.be.revertedWith(
        'Donations must be sent during an active round'
      );
    });
  });
});
