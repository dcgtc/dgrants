import BNotify, { NotificationType } from 'bnc-notify';
import { JsonRpcProvider } from 'src/utils/ethers';
import { getEtherscanUrl } from 'src/utils/utils';

// Instantiate Blocknative's notify.js. We don't pass a dappId/networkId so we can use in UI only mode for any
// notifications we need, i.e. not just Blocknative transaction notifications
const bNotify = BNotify({ desktopPosition: 'topRight' });
const defaultTimeout = 5000; // 4 seconds

// Some error messages we don't want to show to the user, so return in these cases
const messagesToIgnore = [
  'walletSelect must be called before walletCheck', // user decided not to connect wallet
  'unknown account #0', // happens when we try to connect to a locked wallet
  'TypeError: _context.t2 is not a constructor', // https://github.com/dcgtc/dgrants/issues/26
  'PollingBlockTracker - encountered an error while attempting to update latest block', // occurs if you use walletconnect + Argent and connect with a chainId different than DGRANTS_CHAIN_ID
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
  const onclick = () => window.open(getEtherscanUrl(txHash), '_blank');
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
