/**
 * @notice Automates the match payout flow of:
 *   1. Generating payout data
 *   2. Deploying the Merkle Distributor based on the payout data's merkle root
 *   3. Transfers funds to the Merkle Distributor
 *   4. Calls the bulk payout function on the distributor
 *
 * ****************************** WARNING ******************************
 *     THIS SCRIPT IS A WORK IN PROGRESS. DO NOT USE ON MAINNET YET
 *     Search 'TODO' in this file to see what is left to be done
 * *********************************************************************
 *
 * @dev Sample usages are below
 * WARNING: Do not use a network other than hardhat until you are ready to send real transactions
 * NOTE: Currently you'll need to replace `19443600` with `20913000` in hardhat.config.ts to ensure
 *       the fork occurs at the correct block when running locally
 *
 *   Run locally against a forked Polygon (TODO get this working)
 *       HARDHAT_FORK_NETWORK=polygon yarn hardhat payouts-setup --round 0x6c7B74D7640f401271208186e5CbBc6e7E2C73F4
 *   Run against polygon mainnet
 *       yarn hardhat payouts-setup --round 0x6c7B74D7640f401271208186e5CbBc6e7E2C73F4 --network polygon
 *
 * @dev This script must be run by a round's `payoutAdmin` as the signer
 */

import fs from 'fs';
import readline from 'readline';
import { task, types } from 'hardhat/config';
import { BigNumberish } from 'ethers';
import { GrantRound } from '../typechain';
import { CLR, linear, InitArgs } from '@dgrants/dcurve';
import { Contribution } from '@dgrants/types';

const blocksToWait = 10; // number of blocks to wait after each transaction (for re-org protection)

task('payouts-setup', 'Configures the match payouts for the specified round')
  .addParam('round', 'Address of the grant round compute payouts for', undefined, types.string, false)
  .addOptionalParam('block', 'Block to fetch data at', 'latest', types.string)
  .addOptionalParam('ids', 'Array of grant IDs to include in matching calcuations', '', types.string)
  .addOptionalParam('trustbonus', 'Trust bonus data', __filename, types.inputFile)
  .setAction(async (taskArgs, { ethers, network }) => {
    // --- Setup ---
    // Parse input arguments
    const roundAddress = ethers.utils.getAddress(taskArgs.round);
    const _blockNumber = taskArgs.block === 'latest' ? 'latest' : parseInt(taskArgs.block);
    const _ids = taskArgs.ids ? taskArgs.ids.split(',').map((id: string) => id.trim()) : [];
    const trustBonus =
      taskArgs.trustbonus === __filename ? {} : JSON.parse(fs.readFileSync(taskArgs.trustbonus, 'utf-8'));

    // Verify the signer match the payout admin's address when not on Hardhat. If we are on Hardhat, we instead
    // impersonate the payout admin's account
    let [signer] = await ethers.getSigners();
    const round = <GrantRound>await ethers.getContractAt('GrantRound', roundAddress, signer);
    const [payoutAdmin, matchingTokenAddr] = await Promise.all([round.payoutAdmin(), round.matchingToken()]);

    if (network.name === 'hardhat') {
      await network.provider.request({ method: 'hardhat_impersonateAccount', params: [payoutAdmin] });
      signer = await ethers.getSigner(payoutAdmin);
    } else if (signer.address !== payoutAdmin) {
      throw new Error(`Signer's address of ${signer.address} did not match the round's payout admin address of ${payoutAdmin}`); // prettier-ignore
    }

    // --- Fetch data ---
    const erc20Abi = [
      'function balanceOf(address owner) public view returns (uint256 balance)',
      'function decimals() public view returns (uint8)',
    ];
    const matchingToken = new ethers.Contract(matchingTokenAddr, erc20Abi, ethers.provider);
    const [matchingTokenDecimals, totalPot] = await Promise.all([
      matchingToken.decimals(),
      matchingToken.balanceOf(roundAddress),
    ]);

    // Trust bonus scores are to be presented in an array
    const trustBonusScores = Object.keys(trustBonus).map((address) => {
      return { address: address, score: trustBonus[address] };
    });

    // Fetch contributions using subgraph
    const contributions: Contribution[] = []; // TODO

    // --- Compute match amounts ---
    const clr = new CLR({ calcAlgo: linear, includePayouts: true } as InitArgs);
    const distribution = await clr.calculate(
      {
        grantRound: roundAddress,
        totalPot: totalPot,
        matchingTokenDecimals: matchingTokenDecimals,
        contributions: contributions,
      },
      { trustBonusScores: trustBonusScores }
    );
    const merkleRoot = distribution.merkle?.merkleRoot;
    if (!merkleRoot) throw new Error('Merkle root could not be calculated');

    // --- Prompt user to verify data before continuing ---
    // TODO other data to show here?
    await confirmContinue({
      'network                  ': network.name,
      'round address            ': round.address,
      'payout admin             ': payoutAdmin,
      'round match balance      ': totalPot.toString(),
    });

    // --- Deploy the Merkle Distributor ---
    const merkleFactory = await ethers.getContractFactory('MerkleGrantRoundPayout', signer);
    const merklePayout = await merkleFactory.deploy(matchingToken.address, merkleRoot);
    console.log(`Deploying Merkle Distributor to ${merklePayout.address}....`);
    await merklePayout.deployTransaction.wait(blocksToWait);
    console.log('✅ Deployed');

    // --- Transfer funds from Round to Merkle Distributor ---
    const transferTx = await round.payoutGrants(merklePayout.address);
    console.log('Transferring funds to the Merkle Distributor...');
    await transferTx.wait(blocksToWait);
    console.log('✅ Funds transferred');

    // --- Initiate batch payout ---
    // TODO verify current balance of Merkle Distributor matches what the token balance of the GrantRound
    // was before we initiated the token transfer with the `payoutGrants` method
    type Claim = {
      index: BigNumberish;
      payee: string;
      amount: BigNumberish;
      merkleProof: string[];
    };
    const claims: Claim[] = []; // TODO generate the claim inputs
    console.log('Distributing the match payouts...');
    await merklePayout.batchClaim(claims);
    console.log('✅ Payouts distributed!');

    console.log('✅ Done!');
  });

// --- User verification ---
// Helper method for waiting on user input. Source: https://stackoverflow.com/a/50890409
async function waitForInput(query: string): Promise<unknown> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans);
    })
  );
}

async function confirmContinue(params: Record<string, unknown>) {
  console.log('\nDEPLOYMENT PARAMETERS');
  console.table(params);

  const response = await waitForInput('\nDo you want to continue with deployment? y/N\n');
  if (response !== 'y') throw new Error('Aborting deploy: User chose to cancel deployment');
  console.log('\n');
}
