// --- External imports ---
import { artifacts, ethers, waffle } from 'hardhat';
import { deployMockContract, MockContract } from 'ethereum-waffle';

// --- Our imports ---
import { MerkleGrantRoundPayout } from '../typechain/MerkleGrantRoundPayout';
import { expect } from 'chai';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address';
import { Artifact } from 'hardhat/types';
import { tokens } from './utils';

// --- Parse and define helpers ---
const { deployContract } = waffle;
const { isAddress } = ethers.utils;
// const randomAddress = () => ethers.Wallet.createRandom().address;

const ZERO_BYTES32 = '0x0000000000000000000000000000000000000000000000000000000000000000';

describe('MerkleGrantRoundPayout', function () {
  let user: SignerWithAddress;
  let mockToken: MockContract;
  let payout: MerkleGrantRoundPayout;

  before(async () => {
    [user] = await ethers.getSigners();

    // Deploy mock contracts
    mockToken = await deployMockContract(user, ['function totalSupply() returns(uint256)']);
    await mockToken.mock.totalSupply.returns('0');

    // Deploy PayoutContract
    const payoutArtifact: Artifact = await artifacts.readArtifact('MerkleGrantRoundPayout');
    payout = <MerkleGrantRoundPayout>await deployContract(user, payoutArtifact, [tokens.gtc.address, ZERO_BYTES32]);
  });

  describe('constructor', () => {
    it('deploys properly', async function () {
      // Verify deploy
      expect(isAddress(payout.address), 'Failed to deploy MerkleGrantRoundPayout').to.be.true;

      // Verify constructor parameters
      expect(await payout.token()).to.equal(tokens.gtc.address);
      expect(await payout.merkleRoot()).to.equal(ZERO_BYTES32);
    });

    // it('reverts when deploying with an invalid token', async () => {
    //   const payoutArtifact: Artifact = await artifacts.readArtifact('MerkleGrantRoundPayout');
    //   await expect(
    //     deployContract(user, payoutArtifact, [randomAddress(), ZERO_BYTES32])
    //   ).to.be.revertedWith('function call to a non-contract account');
    // });
  });
});
