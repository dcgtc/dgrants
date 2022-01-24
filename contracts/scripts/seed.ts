import { ethers, artifacts } from 'hardhat';
import hre from 'hardhat';

import { Artifact } from 'hardhat/types';
import { BigNumber, BigNumberish, constants, Wallet } from 'ethers'
import { ScriptLogger } from './ScriptLogger';
import bn from 'bignumber.js'
import { approve, balanceOf, setBalance, encodeRoute, getSwapAmountOut } from '../test/utils'; // prettier-ignore

import uniswapFactoryArtifact from "@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json";
import uniswapPoolArtifact from "@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json";

import positionManagerArtifact from '@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json'
import positionDescriptorArtifact from '@uniswap/v3-periphery/artifacts/contracts/NonfungibleTokenPositionDescriptor.sol/NonfungibleTokenPositionDescriptor.json'


bn.config({ EXPONENTIAL_AT: 999999, DECIMAL_PLACES: 40 })


export function encodePriceSqrt(reserve1: BigNumberish, reserve0: BigNumberish): BigNumber {
    return BigNumber.from(
      new bn(reserve1.toString())
        .div(reserve0.toString())
        .sqrt()
        .multipliedBy(new bn(2).pow(96))
        .integerValue(3)
        .toString()
    )
  }
export enum FeeAmount {
LOW = 500,
MEDIUM = 3000,
HIGH = 10000,
}

export const TICK_SPACINGS: { [amount in FeeAmount]: number } = {
[FeeAmount.LOW]: 10,
[FeeAmount.MEDIUM]: 60,
[FeeAmount.HIGH]: 200,
}
  

export const getMinTick = (tickSpacing: number) => Math.ceil(-887272 / tickSpacing) * tickSpacing;
export const getMaxTick = (tickSpacing: number) => Math.floor(887272 / tickSpacing) * tickSpacing;

// IIFE async function so "await"s can be performed for each operation
(async function () {
  const network = hre.network.name;
  // Polygon gas price is predictable and often overestimated, so just hardcode a price for simplicity

  const logger = new ScriptLogger('seed', network);
  let contractsUnderTest = [];

  try {
    // Get the deployer address
    const [deployer] = await ethers.getSigners();
    logger.deployer = deployer.address;

    // Deploy Mock Tokens and Pair
    const metadataAdmin = deployer.address;
    const payoutAdmin = deployer.address;

    const MockToken = await ethers.getContractFactory("MockToken", deployer);

    const matchingToken = await MockToken.deploy(ethers.utils.parseEther('2000'));
    const donationToken = await MockToken.deploy(ethers.utils.parseEther('2000'));
    const weth = await MockToken.deploy(10);
    await matchingToken.deployed();
    await donationToken.deployed();
    await weth.deployed();
    contractsUnderTest.push(["MatchingToken", matchingToken.address]);
    contractsUnderTest.push(["DonationToken", donationToken.address]);
    contractsUnderTest.push(["WETH", weth.address]);


    const UniswapV3Factory = await ethers.getContractFactory(uniswapFactoryArtifact["abi"], uniswapFactoryArtifact["bytecode"], deployer);
    const uniswapFactory = await UniswapV3Factory.deploy();
    await uniswapFactory.deployed();
    
    const poolAddress = await uniswapFactory.callStatic.createPool(matchingToken.address, donationToken.address, 3000);
    await uniswapFactory.createPool(matchingToken.address, donationToken.address, 3000);
    
    const pool = new ethers.Contract(String(poolAddress), uniswapPoolArtifact["abi"], deployer);
    await pool.connect(deployer).initialize(encodePriceSqrt(1, 1));

    const TestUniswapV3Callee = await ethers.getContractFactory("TestUniswapV3Callee", deployer);
    const callee = await TestUniswapV3Callee.deploy()
    await callee.deployed()

    await matchingToken.connect(deployer).approve(callee.address, ethers.constants.MaxUint256);
    await donationToken.connect(deployer).approve(callee.address, ethers.constants.MaxUint256);
    await callee.connect(deployer).mint(pool.address, deployer.address, getMinTick(60), getMaxTick(60), 3161);

    const roundStartTime = '50000000000000'; // random timestamp far in the future
    const roundEndTime = '60000000000000'; // random timestamp far in the future
    const metadataPtr = "nothing";


    // Deploy the GrantRegistry
    const GrantRegistry = await ethers.getContractFactory('GrantRegistry', deployer);
    const registry = await GrantRegistry.deploy();
    await registry.deployed();
    logger.recordContract('GrantRegistry', registry.address);
    contractsUnderTest.push(["GrantRegistry", registry.address]);

    // Deploy the GrantRoundManager
    const GrantRoundManager = await ethers.getContractFactory('GrantRoundManager', deployer);

    const roundManager = await GrantRoundManager.deploy(
        registry.address,
        donationToken.address,
        uniswapFactory.address,
        weth.address
      );
    await roundManager.deployed();

    logger.recordContract("GrantRoundManager", roundManager.address);
    contractsUnderTest.push(["GrantRoundManager", roundManager.address]);

    // Create the GrantRound
    const createGrantRoundTxReceipt = await roundManager.createGrantRound(
      metadataAdmin,
      payoutAdmin,
      matchingToken.address,
      roundStartTime,
      roundEndTime,
      metadataPtr,
      { gasLimit: 1000000 }
    );
    await createGrantRoundTxReceipt.wait();
    logger.recordAction('CreateGrantGround', createGrantRoundTxReceipt.hash);


  console.log("Copy the following into your fuzzing config:")
  console.log(`deployed_contract_address: # Put one of the other contract addresses here`)
  console.log('other_contract_addresses:')
  for (var entry of contractsUnderTest) {
    console.log(`\t- "${entry[1]}" # ${entry[0]}`)
  }

  } catch (error) {
    logger.recordAction('Error', error.toString());
  }

  logger.save();
})();
