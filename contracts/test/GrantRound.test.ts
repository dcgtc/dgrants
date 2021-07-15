// --- External imports ---
import { artifacts, ethers, waffle } from 'hardhat';
// import { BigNumber, BigNumberish } from 'ethers';
import { Artifact } from 'hardhat/types';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address';
import { expect } from 'chai';

// --- Our imports ---
import { GrantRegistry } from '../typechain/GrantRegistry';
import { GrantRound } from '../typechain/GrantRound';
// import { IERC20 } from '../typechain/IERC20';

// --- Parse and define helpers ---
const { deployContract } = waffle;
const { isAddress } = ethers.utils;
const randomAddress = () => ethers.Wallet.createRandom().address;
// const randomPtr = () => String(Math.random()); // doesn't need to be a valid URL for testing
// const BN = (x: BigNumberish) => BigNumber.from(x);

describe('GrantRound', function () {
  /*
  const abi = [
    'function balanceOf(address owner) view returns (uint256)',
    'function decimals() view returns (uint8)',
    'function symbol() view returns (string)',
    'function transfer(address to, uint amount) returns (boolean)',
    'event Transfer(address indexed from, address indexed to, uint amount)',
  ];
  */

  let deployer: SignerWithAddress, user1: SignerWithAddress;
  let registry: GrantRegistry;
  let roundContract: GrantRound;

  beforeEach(async () => {
    [deployer, user1] = await ethers.getSigners();
    // round init -- [user1.address, registry.address, randomAddress(), 123123123, 123123123, "https://test.url", 20]
    // const erc20_rw = new ethers.Contract(addr, abi, user2)
    const grantRegistryArtifact: Artifact = await artifacts.readArtifact('GrantRegistry');
    registry = <GrantRegistry>await deployContract(deployer, grantRegistryArtifact);

    const grantRoundArtifact: Artifact = await artifacts.readArtifact('GrantRound');
    roundContract = <GrantRound>(
      await deployContract(deployer, grantRoundArtifact, [
        user1.address,
        registry.address,
        randomAddress(),
        123123123,
        123123123,
        'https://test.url',
        20,
      ])
    );
  });

  describe('Initialization', () => {
    it.only('deploys properly', async function () {
      expect(isAddress(roundContract.address), 'Failed to deploy GrantRegistry').to.be.true;
    });
  });
});
