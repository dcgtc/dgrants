/**
 * @notice Given a data file with contribution data and merkle tree data, this script automates
 * the match payout flow of:
 *   1. Deploying the Merkle Distributor based on the payout data's merkle root
 *   2. Transferring the match funds to the Merkle Distributor
 *   3. Calling the bulk payout function on the distributor
 *
 * To use this, create a file in the `payout-data` folder called <dataName>.data.ts, and pass
 * the name of the data set as an argument when calling this script. See sample usage for the
 * dGrants POC round below.
 *
 * @dev Sample usages
 * WARNING: Do not use a network other than hardhat until you are ready to send real transactions
 *
 * NOTE: Currently you'll need to replace `19443600` with `20913000` in hardhat.config.ts to ensure
 * the fork occurs at the correct block when running locally. If you do not do this, you'll get a
 * `CALL_EXCEPTION` error because the grant round was not deployed until after block 19443600
 *
 * NOTE: This script must be run by a round's `payoutAdmin` as the signer, unless running against a
 * local network
 *
 *   Run locally against a forked Polygon (remember to change the block in the hardhat config as explained above)
 *       HARDHAT_FORK_NETWORK=polygon yarn hardhat execute-payouts --name poc
 *
 *   Run against polygon mainnet
 *       yarn hardhat execute-payouts --name poc --network polygon
 */

import readline from 'readline';
import { task } from 'hardhat/config';
import { GrantRound } from '../typechain';

task('execute-payouts', 'Configures the match payouts for the specified round')
  .addParam('name', 'payout-data file containing the data to use, e.g. `poc` to use payout-data/poc.data.ts')
  .setAction(async (taskArgs, { ethers, network }) => {
    // --- Setup ---
    // Pull out some utils
    const { formatUnits, isHexString } = ethers.utils;

    // Import the match data
    const dataPath = `./payout-data/${String(taskArgs.name)}.data.ts`;
    const { round: roundAddress, data: distributionData } = await import(dataPath);

    // If hardhat, don't wait any extra blocks after sending transaction.
    // If not hardhat, wait 10 blocks for re-org protection
    const blocksToWait = network.name === 'hardhat' ? undefined : 10;

    // Verify the signer match the payout admin's address when not on Hardhat. If we are on Hardhat, we instead
    // impersonate the payout admin's account and connect it to the round instance
    let [signer] = await ethers.getSigners();
    let round = <GrantRound>await ethers.getContractAt('GrantRound', roundAddress, signer);
    const [payoutAdmin, matchingTokenAddr] = await Promise.all([round.payoutAdmin(), round.matchingToken()]);

    if (network.name === 'hardhat') {
      await network.provider.request({ method: 'hardhat_impersonateAccount', params: [payoutAdmin] });
      signer = await ethers.getSigner(payoutAdmin);
      round = round.connect(signer);
    } else if (signer.address !== payoutAdmin) {
      throw new Error(`Signer's address of ${signer.address} did not match the round's payout admin address of ${payoutAdmin}`); // prettier-ignore
    }

    // --- Fetch and format data ---
    // Token data
    const erc20Abi = [
      'function balanceOf(address owner) external view returns (uint256 balance)',
      'function decimals() external view returns (uint8)',
      'function symbol() external view returns (string)',
    ];
    const matchingToken = new ethers.Contract(matchingTokenAddr, erc20Abi, ethers.provider);
    const [matchingTokenDecimals, matchingTokenSymbol, totalPot] = await Promise.all([
      matchingToken.decimals(),
      matchingToken.symbol(),
      matchingToken.balanceOf(roundAddress),
    ]);

    // Verify we have a valid merkle root
    const merkleRoot = distributionData.merkle.merkleRoot;
    if (!merkleRoot || merkleRoot.length !== 66 || !isHexString(merkleRoot)) {
      throw new Error('Merkle root could not be found');
    }

    // Reshape claims into an array for batch claiming funds
    const claims = Object.keys(distributionData.merkle.claims).map((key) => {
      return {
        index: distributionData.merkle.claims[key].index,
        payee: key,
        amount: distributionData.merkle.claims[key].amount,
        merkleProof: distributionData.merkle.claims[key].proof,
      };
    });

    // --- Prompt user to verify data before continuing ---
    await confirmContinue({
      'network                            ': network.name,
      'round address                      ': round.address,
      'payout admin (should match signer) ': payoutAdmin,
      'signer address                     ': signer.address,
      'round match balance                ': `${formatUnits(totalPot, matchingTokenDecimals)} ${matchingTokenSymbol}`,
      'merkle root                        ': merkleRoot,
      'number of claims                   ': claims.length,
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

    // Verify transfer worked as expected
    const merkleBalance = await matchingToken.balanceOf(merklePayout.address);
    if (!merkleBalance.eq(totalPot)) {
      console.log('\n******************** WARNING ********************');
      console.log('Balance of Merkle distributor does not match original Grant Round match balance.');
      console.log('Review the details below and decide if you want to continue this script.');
      console.log('Balances are shown in raw units to ensure values are accurately printed.');
      await confirmContinue({
        'Original match balance             ': `${totalPot.toString()} ${matchingTokenSymbol}`,
        'Current Merkle distributor balance ': `${merkleBalance.toString()} ${matchingTokenSymbol}`,
      });
    }

    console.log('✅ Funds transferred');

    // --- Initiate batch payout ---
    const claimTx = await merklePayout.batchClaim(claims);
    console.log('Executing batch claim on behalf of all match recipients...');
    await claimTx.wait(blocksToWait);
    console.log('✅ Payouts distributed');

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
  console.log('\nPARAMETERS');
  console.table(params);

  const response = await waitForInput('\nDo you want to continue? y/N\n');
  if (response !== 'y') throw new Error('Aborting script: User chose to exit script');
  console.log('\n');
}
