// --- External imports ---
import { artifacts, ethers, waffle } from 'hardhat';

// --- Our imports ---
import { MerkleGrantRoundPayout } from '../typechain/MerkleGrantRoundPayout';
import { expect } from 'chai';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address';
import { Artifact } from 'hardhat/types';
import { balanceOf, setBalance, tokens } from './utils';
import { BalanceTree } from '../../utils/src/merkle-distributor/balance-tree';
import { BigNumber, Contract, utils } from 'ethers';
import { Claim } from '../../types/src';

// --- Parse and define helpers ---
const { deployContract } = waffle;
const { isAddress } = ethers.utils;
const randomAddress = () => ethers.Wallet.createRandom().address;

const RANDOM_BYTES32 = utils.randomBytes(32);

describe('MerkleGrantRoundPayout', function () {
  let user: SignerWithAddress;
  let payout: MerkleGrantRoundPayout;

  before(async () => {
    [user] = await ethers.getSigners();

    // Deploy PayoutContract
    const payoutArtifact: Artifact = await artifacts.readArtifact('MerkleGrantRoundPayout');
    payout = <MerkleGrantRoundPayout>await deployContract(user, payoutArtifact, [tokens.dai.address, RANDOM_BYTES32]);
  });

  describe('constructor', () => {
    it('deploys properly', async function () {
      // Verify deploy
      expect(isAddress(payout.address), 'Failed to deploy MerkleGrantRoundPayout').to.be.true;

      // Verify constructor parameters
      expect(await payout.token()).to.equal(tokens.dai.address);
      expect(await payout.merkleRoot()).to.equal(utils.hexlify(RANDOM_BYTES32));
    });
  });

  describe('claim', () => {
    let payout: Contract;
    let tree: BalanceTree;
    // user0
    let user0: SignerWithAddress;
    let proof0: string[];
    let claim0Arg: Claim;
    // user1
    let user1: SignerWithAddress;
    let proof1: string[];
    let claim1Arg: Claim;

    beforeEach(async () => {
      [user0, user1] = await ethers.getSigners();

      tree = new BalanceTree([
        { account: user0.address, amount: BigNumber.from(100) },
        { account: user1.address, amount: BigNumber.from(101) },
      ]);
      const payoutArtifact: Artifact = await artifacts.readArtifact('MerkleGrantRoundPayout');
      payout = await deployContract(user, payoutArtifact, [tokens.dai.address, tree.getHexRoot()]);

      proof0 = tree.getProof(0, user0.address, BigNumber.from(100));
      claim0Arg = { index: 0, payee: user0.address, amount: 100, merkleProof: proof0 };

      proof1 = tree.getProof(1, user1.address, BigNumber.from(101));
      claim1Arg = { index: 1, payee: user1.address, amount: 101, merkleProof: proof1 };

      await setBalance('dai', payout.address, 201);
      await setBalance('dai', user0.address, 0);
      await setBalance('dai', user1.address, 0);
    });

    it('fails for empty proof', async () => {
      claim0Arg = { index: 0, payee: await randomAddress(), amount: 10, merkleProof: [] };
      await expect(payout.claim(claim0Arg)).to.be.revertedWith('MerkleGrantRoundPayout: Invalid proof.');
    });

    it('successful claim', async () => {
      await expect(payout.claim(claim0Arg)).to.emit(payout, 'Claimed').withArgs(0, user0.address, 100);
      await expect(payout.claim(claim1Arg)).to.emit(payout, 'Claimed').withArgs(1, user1.address, 101);
    });

    it('contract transfers the token', async () => {
      expect(await balanceOf('dai', user0.address)).to.eq(0);

      await payout.claim(claim0Arg);

      expect(await balanceOf('dai', user0.address)).to.eq(100);
    });

    it('contract must have enough to transfer', async () => {
      await setBalance('dai', payout.address, 99);

      await expect(payout.claim(claim0Arg)).to.be.revertedWith('Dai/insufficient-balance');
    });

    it('sets #hasClaimed', async () => {
      expect(await payout.hasClaimed(0)).to.false;
      expect(await payout.hasClaimed(1)).to.false;

      await payout.claim(claim0Arg);

      expect(await payout.hasClaimed(0)).to.true;
      expect(await payout.hasClaimed(1)).to.false;
    });

    it('cannot allow two claims', async () => {
      await payout.claim(claim0Arg);
      await expect(payout.claim(claim0Arg)).to.be.revertedWith('MerkleGrantRoundPayout: Funds already claimed.');
    });

    it('user0 cannot claim second time after user1 has claimed ', async () => {
      await payout.claim(claim0Arg);
      await payout.claim(claim1Arg);

      await expect(payout.claim(claim0Arg)).to.be.revertedWith('MerkleGrantRoundPayout: Funds already claimed.');
    });

    it('user1 cannot claim second time after user0 has claimed ', async () => {
      await payout.claim(claim1Arg);
      await payout.claim(claim0Arg);

      await expect(payout.claim(claim1Arg)).to.be.revertedWith('MerkleGrantRoundPayout: Funds already claimed.');
    });

    it('cannot claim for address other than proof', async () => {
      proof0 = tree.getProof(0, user0.address, BigNumber.from(100));
      claim0Arg = { index: 1, payee: user1.address, amount: 100, merkleProof: proof0 };
      await expect(payout.claim(claim0Arg)).to.be.revertedWith('MerkleGrantRoundPayout: Invalid proof.');
    });

    it('cannot claim more than proof amount', async () => {
      proof0 = tree.getProof(0, user0.address, BigNumber.from(100));
      claim0Arg = { index: 1, payee: user0.address, amount: 101, merkleProof: proof0 };
      await expect(payout.claim(claim0Arg)).to.be.revertedWith('MerkleGrantRoundPayout: Invalid proof.');
    });
  });

  describe('batchClaim', () => {
    let payout: Contract;
    let tree: BalanceTree;
    // user0
    let user0: SignerWithAddress;
    let proof0: string[];
    let claim0Arg: Claim;
    // user1
    let user1: SignerWithAddress;
    let proof1: string[];
    let claim1Arg: Claim;

    beforeEach(async () => {
      const signers = await ethers.getSigners();
      user0 = signers[0];
      user1 = signers[1];

      tree = new BalanceTree([
        { account: user0.address, amount: BigNumber.from(100) },
        { account: user1.address, amount: BigNumber.from(101) },
      ]);

      const payoutArtifact: Artifact = await artifacts.readArtifact('MerkleGrantRoundPayout');
      payout = await deployContract(user, payoutArtifact, [tokens.dai.address, tree.getHexRoot()]);

      proof0 = tree.getProof(0, user0.address, BigNumber.from(100));
      claim0Arg = { index: 0, payee: user0.address, amount: 100, merkleProof: proof0 };

      proof1 = tree.getProof(1, user1.address, BigNumber.from(101));
      claim1Arg = { index: 1, payee: user1.address, amount: 101, merkleProof: proof1 };

      await setBalance('dai', payout.address, 201);
      await setBalance('dai', user0.address, 0);
      await setBalance('dai', user1.address, 0);
    });

    it('fails for empty proof', async () => {
      claim0Arg = { index: 0, payee: await randomAddress(), amount: 10, merkleProof: [] };
      await expect(payout.batchClaim([claim0Arg])).to.be.revertedWith('MerkleGrantRoundPayout: Invalid proof.');
    });

    it('successful batchClaim', async () => {
      const batchClaim = payout.batchClaim([claim0Arg, claim1Arg]);

      // check Claimed event is emitted
      await expect(batchClaim).to.emit(payout, 'Claimed').withArgs(0, user0.address, 100);
      await expect(batchClaim).to.emit(payout, 'Claimed').withArgs(1, user1.address, 101);
    });

    it('sets #hasClaimed', async () => {
      expect(await payout.hasClaimed(0)).to.false;
      expect(await payout.hasClaimed(1)).to.false;

      await payout.batchClaim([claim0Arg, claim1Arg]);

      expect(await payout.hasClaimed(0)).to.true;
      expect(await payout.hasClaimed(1)).to.true;
    });

    it('balance is updated', async () => {
      // check balance of users
      expect(await balanceOf('dai', user0.address)).to.eq(0);
      expect(await balanceOf('dai', user1.address)).to.eq(0);
      expect(await balanceOf('dai', payout.address)).to.eq(201);

      await payout.batchClaim([claim0Arg, claim1Arg]);

      // check balance of users
      expect(await balanceOf('dai', user0.address)).to.eq(100);
      expect(await balanceOf('dai', user1.address)).to.eq(101);
      expect(await balanceOf('dai', payout.address)).to.eq(0);
    });

    it('user 0 cannot claim a second time', async () => {
      await payout.batchClaim([claim0Arg, claim1Arg]);

      await expect(payout.claim(claim0Arg)).to.be.revertedWith('MerkleGrantRoundPayout: Funds already claimed.');
      await expect(payout.batchClaim([claim0Arg])).to.be.revertedWith('MerkleGrantRoundPayout: Funds already claimed.');
    });

    it('user 1 cannot claim a second time', async () => {
      await payout.batchClaim([claim0Arg, claim1Arg]);

      await expect(payout.claim(claim1Arg)).to.be.revertedWith('MerkleGrantRoundPayout: Funds already claimed.');
      await expect(payout.batchClaim([claim1Arg])).to.be.revertedWith('MerkleGrantRoundPayout: Funds already claimed.');
    });

    it('batchClaim can be invoked twice for diff users', async () => {
      expect(await payout.hasClaimed(0)).to.false;
      expect(await payout.hasClaimed(1)).to.false;

      await payout.batchClaim([claim0Arg]);
      await payout.batchClaim([claim1Arg]);

      expect(await payout.hasClaimed(0)).to.true;
      expect(await payout.hasClaimed(1)).to.true;
    });
  });
});
