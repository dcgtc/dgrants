/**
 * @notice Various helper methods and formatters to help display data in the UI nicely
 */
import router from 'src/router/index';
import { RouteLocationRaw } from 'vue-router';
import { Event } from 'ethers';
import { BigNumber, BigNumberish, commify, Contract, ContractTransaction, isAddress } from 'src/utils/ethers';
import { BatchFilterQuery, EtherscanGroup } from 'src/types';
import useWalletStore from 'src/store/wallet';
import { GrantRound } from '@dgrants/types';
import { formatUnits } from 'src/utils/ethers';
import { ETH_ADDRESS } from 'src/utils/constants';
import { ETHERSCAN_BASE_URL, FILTER_BLOCK_LIMIT, SUPPORTED_TOKENS_MAPPING, WETH_ADDRESS } from 'src/utils/chains';

// --- Formatters ---
// Returns an address with the following format: 0x1234…abcd
export function formatAddress(address: string) {
  if (!address || address.length !== 42) return '';
  return `${address.slice(0, 6)}…${address.slice(38)}`;
}

// Is the given val defined?
export function isDefined(val: unknown) {
  return !!val;
}

// Formats a number for display to the user, by rounding to the specified number of decimals and adding commas
export function formatNumber(value: BigNumberish, decimals: number): string {
  // `BigNumber.from()` can't take decimal inputs nor exponential inputs
  value = typeof value === 'number' || typeof value === 'string' ? Number(value) : BigNumber.from(value);
  // Return value with minimum number of decimals shown, e.g. return '123' if input is 123.00.
  // When number > MAX_SAFE_INTEGER, we lose precision because JS can't handle numbers that large.
  // When number >= 1e21, it formats the number as 1e+21 instead of 1000...000, causing the call to `commify` to fail
  // because it doesn't support scientific notation. In those cases, we catch the error and convert to a formatted
  // string using `.toLocaleString()`. In reality, we don't want users checking out with numbers that large anyway
  // due to precision loss, and in reality this will not happen because no one owns that many tokens. So the
  // try/catch is mainly for UX reasons here to resolve https://github.com/dcgtc/dgrants/issues/291
  const number = parseFloat(Number(value).toFixed(decimals));
  try {
    return commify(number);
  } catch (err) {
    return number.toLocaleString();
  }
}

// Expects a unix timestamp and will return a human readable message of how far in the past/future it is
export function daysAgo(val = 0) {
  // Use a formatter to establish "in 10 days" vs "10 days ago"
  const formatter = new Intl.RelativeTimeFormat();
  // Number of days since now
  const deltaDays = (val * 1000 - Date.now()) / (1000 * 3600 * 24);

  // Format "days ago" as string
  return formatter.format(Math.round(deltaDays), 'days');
}

// Convert a unix ts to a toLocaleString
export function unixToLocaleString(time: BigNumberish) {
  return new Date(BigNumber.from(time).toNumber() * 1000).toLocaleString();
}

// Normalize twitter handle
export function urlFromTwitterHandle(handle: string) {
  const twitterHandle = handle.includes('@') ? handle.substring(1) : handle;
  return 'https://twitter.com/' + twitterHandle;
}

// Clean twitter url and return the handle
export function cleanTwitterUrl(url: string | undefined) {
  return url ? url.replace('https://twitter.com/', '') : undefined;
}

// --- Validation ---
// Returns true if the provided URL is a valid URL
export function isValidUrl(val: string) {
  // TODO more robust URL validation
  return (val.includes('http') || val.includes('https')) && val.includes('://') && val.includes('.');
}

// Returns true if the provided address is valid (TODO support ENS)
export function isValidAddress(val: string | undefined) {
  return val && isAddress(val);
}

// Returns true if the provided website is a valid option
export function isValidWebsite(val: string | undefined) {
  return val ? isValidUrl(val) : true;
}

// Returns true if the provided URL is a valid Github URL
export function isValidGithub(val: string | undefined) {
  return val ? val.includes('://github.com/') : true;
}

// Returns true if the provided twitter handle is valid
export function isValidTwitter(val: string | undefined) {
  if (!val) return true;
  const handle = val.includes('@') ? val.substring(1) : val;
  return /^[a-zA-Z0-9_]{1,15}$/.test(handle);
}

// Returns true if the provided logo is valid
export async function isValidLogo(file: File | undefined) {
  if (!file) return true;
  if (file.size > 5242880) return false;
  if (!(file.type.includes('image/png') || file.type.includes('image/svg'))) return false;

  const dimensions = await new Promise<{ width: number; height: number }>((resolve) => {
    const img = new Image();
    img.src = window.URL.createObjectURL(file);
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
  });

  return dimensions.width >= 500 && dimensions.height >= 500;
}

// Returns true if the provided amount is valid
export function isValidAmount(val: number | undefined) {
  return val && Number(val) && Number(val) > 0;
}

// --- Tokens ---
// Check for approved allowance
export async function checkAllowance(token: Contract, ownerAddress: string | undefined, spenderAddress: string) {
  // return the balance held for userAddress
  return ownerAddress ? await token.allowance(ownerAddress, spenderAddress) : BigNumber.from(0);
}

// Get approval for the round contract to spend the amount on behalf of the user
export async function getApproval(token: Contract, address: string, amount: BigNumberish) {
  // get approval
  const tx: ContractTransaction = await token.approve(address, amount);
  // wait for approval to go through
  await tx.wait();
}

// --- Other ---
// Check against the grantRounds status for a match
export function hasStatus(status: string) {
  // returns a fn (currying the given status)
  return (round: GrantRound) => round.status === status;
}

// Navigates to the specified page and pushes a new entry into the history stack
export async function pushRoute(to: RouteLocationRaw) {
  await router.push(to);
}

// Generates the Etherscan URL based on the given `hash`, `chainId` and `group`
export function getEtherscanUrl(hash: string, group: EtherscanGroup = 'tx') {
  return `${ETHERSCAN_BASE_URL}/${group}/${hash}`;
}

/**
 * @notice Throws an error if the user does not have sufficient balance for the specified token
 * @param tokenAddress Address of the token to check
 * @param requiredAmount Amount required as a raw number, e.g. 5e18 if the user needs 5 DAI
 * @returns True if the user has sufficient balance, or throws otherwise
 */
export async function assertSufficientBalance(tokenAddress: string, requiredAmount: BigNumberish): Promise<boolean> {
  const { provider, userAddress } = useWalletStore();
  if (!userAddress.value) return true; // exit early, don't want any errors thrown
  const isEth = tokenAddress === WETH_ADDRESS;
  tokenAddress = isEth ? ETH_ADDRESS : tokenAddress;
  const abi = ['function balanceOf(address) view returns (uint256)'];
  const token = new Contract(tokenAddress, abi, provider.value);
  const balance = isEth ? await provider.value.getBalance(userAddress.value) : await token.balanceOf(userAddress.value);
  if (balance.lt(requiredAmount)) {
    const tokenInfo = SUPPORTED_TOKENS_MAPPING[tokenAddress];
    const { symbol, decimals } = tokenInfo;
    const balanceNeeds = formatNumber(formatUnits(requiredAmount, decimals), 4);
    const balanceHas = formatNumber(formatUnits(balance, decimals), 4);
    throw new Error(
      `Insufficient ${symbol} balance: Current cart requires ${balanceNeeds} ${symbol}, but you only have ${balanceHas} ${symbol}`
    );
  }
  return true;
}

/**
 * @notice Get the multicall data for the fns on a contract @ address
 * @param calls {target, contract, fns} The address, contract and fns we want to call via multicall
 * @returns A list of calls we can make to multicall.tryBlockAndAggregate()
 */
export const getMulticallData = (
  calls: {
    target: string;
    contract: Contract;
    fns: (string | { fn: string; args: (string | BigNumberish | boolean)[] })[];
  }[]
) => {
  const flatMap: {
    target: string;
    callData: string;
  }[] = [];
  calls.forEach((call) =>
    flatMap.push(
      ...call.fns.map((fn) => {
        const args = typeof fn === 'string' ? [fn] : [fn.fn, fn.args];
        return {
          target: call.target,
          callData: call.contract.interface.encodeFunctionData(
            args[0] as string,
            args[1] as (string | BigNumberish | boolean)[]
          ),
        };
      })
    )
  );

  return flatMap;
};

/**
 * @notice Decode the returnData we get by calling multicall.tryBlockAndAggregate
 * @param returnData An array of multicall.tryBlockAndAggregate results
 * @param calls {contract, fns} The contract and fns we want to decode the result for
 * @returns all results returned in an array
 */
export const decodeMulticallReturnData = (
  returnData: { success: boolean; returnData: string }[],
  calls: { contract: Contract; fns: (string | { fn: string; args: (string | BigNumberish | boolean)[] })[] }[]
) => {
  let flatPtr = 0;
  const flatMap: (string | BigNumberish | boolean)[] = [];
  calls.forEach((call) =>
    flatMap.push(
      ...call.fns.map((fn) => {
        return call.contract.interface.decodeFunctionResult(
          typeof fn === 'string' ? fn : fn.fn,
          returnData[flatPtr++].returnData
        )[0];
      })
    )
  );

  return flatMap;
};

/**
 * @notice Get the response from a call to multicall for the given fns on a contract @ address
 * @param calls {target, contract, fns} The address, contract and fns we want to call via multicall
 * @returns all results returned in an array
 */
export async function callMulticallContract(
  calls: { target: string; contract: Contract; fns: (string | { fn: string; args: (string | BigNumberish)[] })[] }[]
) {
  const { multicall } = useWalletStore();
  const { returnData } = (await multicall.value?.tryBlockAndAggregate(false, getMulticallData(calls))) || {};

  return decodeMulticallReturnData(returnData, calls);
}

/**
 * @notice Batch filter calls so that no block exceeds the FILTER_BLOCK_LIMIT
 * @param query {contract, filter, args} The contract, filter and args we want to query
 * @param startBlock Number The block we want to query from
 * @param endBlock Number The block we want to query to
 * @returns all results returned in an array
 */
export async function batchFilterCall(query: BatchFilterQuery, startBlock: number, endBlock: number) {
  // collect a list of blocks to feed to promise.all
  const forBlocks = [];
  // startBlock exceeds endBlock after final batch
  while (startBlock < endBlock) {
    // get the results
    forBlocks.push({
      startBlock: startBlock,
      // stop at the endBlock
      endBlock:
        FILTER_BLOCK_LIMIT === -1 || startBlock + FILTER_BLOCK_LIMIT > endBlock
          ? endBlock
          : startBlock + FILTER_BLOCK_LIMIT,
    });
    // move to the next block or end
    startBlock += FILTER_BLOCK_LIMIT === -1 ? endBlock : FILTER_BLOCK_LIMIT;
  }

  // await for each query filter
  const events = await Promise.all(
    forBlocks.map((block) =>
      query.contract.queryFilter(query.contract.filters[query.filter](...query.args), block.startBlock, block.endBlock)
    )
  );

  // flat map the results
  return events.reduce((res: Event[], resSet: Event[]) => {
    res.push(...resSet);

    return res;
  }, [] as Event[]);
}
