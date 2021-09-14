/**
 * @notice Deploys an instance of the GrantRegistry and initialize is with dummy data
 * @dev Used for testing the UI
 * @dev To ensure the GrantRegistry deploys to the expected address, make sure your mnemonic is set to the Hardhat
 * default mnemonic of `test test test test test test test test test test test junk`. When set correctly, the
 * GrantRegistry contract should be deployed locally to 0x5FbDB2315678afecb367f032d93F642f64180aa3
 */

// --- External imports ---
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { Contract, ContractFactory } from 'ethers';
import { ethers, network } from 'hardhat';
import { WETH_ADDRESS, UNISWAP_FACTORY, tokens, setBalance, approve, setNextBlockTimestamp } from '../test/utils';
import { parseUnits } from 'ethers/lib/utils';

const fixtureGrants = async (deployer: SignerWithAddress) => {
  // Define grants to create (addresses are random)
  const grants = [
    {
      owner: '0x34f4E532a33EB545941e914B25Efe348Aea31f0A',
      payee: '0x06c94663E5884BE4cCe85F0869e95C7712d34803',
      metaPtr: 'https://ipfs-dev.fleek.co/ipfs/QmaHTgor7GhetW3nmev3UqabjrzbKJCe7q1v8Wfg3aZyV4',
    },
    {
      owner: '0x58E52440F56f2A5307772Ec881BCEf2c15e988Ab',
      payee: '0x6f02c37ea174DD05f20aC118da725ffa6A40B990',
      metaPtr: 'https://ipfs-dev.fleek.co/ipfs/Qma9gnPTmdZ65UVjJd9nkM6S8etti8qtNBD1ta6vVpSSVS',
    },
    {
      owner: '0x1fB6C46e6aDD95698352707D7f93a31030c80a0B',
      payee: '0x834e659c6757E250db500fe869877311Bb552966',
      metaPtr: 'https://ipfs-dev.fleek.co/ipfs/QmTQMgoxDRj8gfNn5Cvznt5CoEE6cz9MQeZrQsNb36BMdm',
    },
  ];

  // Deploy contract
  const GrantRegistryFactory: ContractFactory = await ethers.getContractFactory('GrantRegistry', deployer);
  const registry = await (await GrantRegistryFactory.deploy()).deployed();
  console.log(`Deployed GrantRegistry to ${registry.address}`);

  // Create the grants
  await Promise.all(grants.map((grant) => registry.createGrant(grant.owner, grant.payee, grant.metaPtr)));
  console.log(`Created ${grants.length} dummy grants`);

  return registry;
};

const fixtureManager = async (deployer: SignerWithAddress, registry: Contract) => {
  // --- GrantRoundManager --
  const GrantRoundManager: ContractFactory = await ethers.getContractFactory('GrantRoundManager', deployer);
  const roundManager = await (
    await GrantRoundManager.deploy(registry.address, tokens.dai.address, UNISWAP_FACTORY, WETH_ADDRESS)
  ).deployed();

  console.log(`Deployed GrantRoundManager to ${roundManager.address}`);
  return roundManager;
};

const fixtureRound = async (registry: Contract, manager: Contract) => {
  // --- GRANT ROUND ---
  let startTime = Math.floor(new Date().getTime() / 1000); // time in seconds
  startTime = await setNextBlockTimestamp(startTime + 200);

  const endTime = startTime + 86400 * 5; // 5 days later

  // GrantRound Argument
  const metadataAdmin = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
  const payoutAdmin = '0x06c94663E5884BE4cCe85F0869e95C7712d34803';
  const matchingToken = tokens.dai.address;
  const metaPtr = 'https://ipfs-dev.fleek.co/ipfs/bafybeib5r75zbrzavbskwywct42alawcwo7d4dlyipimvnjy23hfkqhham';

  const tx = await manager.createGrantRound(
    metadataAdmin,
    payoutAdmin,
    matchingToken,
    Math.floor(startTime),
    Math.floor(endTime),
    metaPtr
  );
  console.log(`Txn to create GrantRound: ${tx.hash}`);

  // Parse data from the event to get the address of the new GrantRound
  const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
  const log = manager.interface.parseLog(receipt.logs[0]);
  const { grantRound: grantRoundAddress } = log.args;
  console.log(`Deployed GrantRound to ${grantRoundAddress}`);

  await setBalance('dai', grantRoundAddress, parseUnits('10000', 18));
  console.log(`Set ${grantRoundAddress} totalPot`);

  return grantRoundAddress;
};

const fixtureRoundDonate = async (manager: Contract, roundAddress: string) => {
  const deadline = '10000000000';

  const signers = await ethers.getSigners();
  const user1 = signers[3];
  const user2 = signers[4];

  // user 1 donates
  await approve('dai', user1, manager.address);
  let swaps = [{ amountIn: parseUnits('10', 18), amountOutMin: '0', path: tokens.dai.address }];
  let donations = [
    { grantId: 0, token: tokens.dai.address, ratio: parseUnits('0.25', 18), rounds: [roundAddress] },
    { grantId: 1, token: tokens.dai.address, ratio: parseUnits('0.75', 18), rounds: [roundAddress] },
  ];
  await manager.connect(user1).donate(swaps, deadline, donations); // donate from user0

  // user 2 donates
  await approve('dai', user2, manager.address);
  swaps = [{ amountIn: parseUnits('35', 18), amountOutMin: '0', path: tokens.dai.address }];
  donations = [
    { grantId: 0, token: tokens.dai.address, ratio: parseUnits('0.5', 18), rounds: [roundAddress] },
    { grantId: 1, token: tokens.dai.address, ratio: parseUnits('0.25', 18), rounds: [roundAddress] },
    { grantId: 2, token: tokens.dai.address, ratio: parseUnits('0.25', 18), rounds: [roundAddress] },
  ];

  await manager.connect(user2).donate(swaps, deadline, donations); // donate from user12
  console.log(`5 contributions ingested`);
};

// --- Method to execute ---
async function main(): Promise<void> {
  // Only run on Hardhat network
  if (network.name !== 'localhost') throw new Error('This script is for use with a running local node');

  const signers = await ethers.getSigners();
  const deployer = signers[16]; // use a random signer to minimize chance of mainnet use bumping the nonce and changing deploy address

  // SetBalance on signer accounts
  await Promise.all(
    signers.map(async (signer) => {
      await setBalance('gtc', signer.address, parseUnits('10000', 18));
      await setBalance('dai', signer.address, parseUnits('10000', 18));
      await setBalance('usdc', signer.address, parseUnits('10000', 6));
      await setBalance('uni', signer.address, parseUnits('10000', 18));
    })
  );

  console.log(`Funded ${signers.length} accounts`);

  // --- GrantRegistry Setup ---
  const registry = await fixtureGrants(deployer);

  // --- GrantRoundManager Setup ---
  const manager = await fixtureManager(deployer, registry);

  // --- GrantRound Setup ---
  const roundAddress = await fixtureRound(registry, manager);

  // -- GrantRoundDonate
  await fixtureRoundDonate(manager, roundAddress);
}

// --- Execute main() ---
void main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
