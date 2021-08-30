import BNotify, { NotificationType } from 'bnc-notify';
import { JsonRpcProvider } from 'src/utils/ethers';

// Instantiate Blocknative's notify.js. We don't pass a dappId/networkId so we can use in UI only mode for any
// notifications we need, i.e. not just Blocknative transaction notifications
const bNotify = BNotify({ desktopPosition: 'topRight' });
const defaultTimeout = 5000; // 4 seconds

// Some error messages we don't want to show to the user, so return in these cases
const messagesToIgnore = [
  'walletSelect must be called before walletCheck', // user decided not to connect wallet
  'unknown account #0', // happens when we try to connect to a locked wallet
  'TypeError: _context.t2 is not a constructor', // https://github.com/dcgtc/dgrants/issues/26
];

/**
 * @notice Show alert to the user
 * @param alertType Defines alert style, options are 'hint' (gray), 'pending' (yellow), 'success' (green), 'error' (red)
 * @param message Message to display on notification
 */
export function notifyUser(alertType: NotificationType, message: string) {
  // If message matches any of the substrings in messagesToIgnore, we return and don't show the alert
  if (new RegExp(messagesToIgnore.join('|')).test(message)) return;

  bNotify.notification({
    autoDismiss: alertType === 'error' ? 10000 : defaultTimeout,
    eventCode: 'userNotify',
    message,
    type: alertType,
  });
}

/**
 * @notice Show error message to user
 * @param err Error object thrown
 * @param msg Optional, fallback error message if one is not provided by the err object
 */
export function handleError(err: Error, msg = 'An unknown error occurred') {
  console.error(err);
  if (!err) notifyUser('error', msg);
  else if ('message' in err) notifyUser('error', err.message);
  else if (typeof err === 'string') notifyUser('error', err);
  else notifyUser('error', msg);
}

/**
 * @notice Transaction notification status
 * @param txHash Transaction hash to monitor
 */
export async function txNotify(txHash: string, provider: JsonRpcProvider) {
  // Instantiate pending transaction notification
  const { chainId } = await provider.getNetwork();
  const onclick = () => window.open(getEtherscanUrl(txHash, chainId), '_blank');
  const { update } = bNotify.notification({
    autoDismiss: 0,
    eventCode: 'txPending',
    message: 'Your transaction is pending',
    onclick,
    type: 'pending',
  });

  // Update notification based on transaction status
  const { status } = await provider.waitForTransaction(txHash);
  update({
    autoDismiss: defaultTimeout,
    eventCode: status ? 'txSuccess' : 'txFail',
    message: status ? 'Your transaction has succeeded' : 'Your transaction has failed',
    onclick,
    type: status ? 'success' : 'error',
  });
}

/**
 * @notice Generates the Etherscan URL based on the given `txHash` and `chainId`
 */
function getEtherscanUrl(txHash: string, chainId: number) {
  // Only mainnet is supported, but we include chain ID 31337 for local testing against Hardhat
  let networkPrefix = '';
  if (chainId === 1) networkPrefix = 'etherscan.io';
  else if (chainId === 31337) networkPrefix = 'etherscan.io';
  else throw new Error(`Could not generate Etherscan URL: Invalid chain ID ${chainId}`);
  return `https://${networkPrefix}/tx/${txHash}`;
}
