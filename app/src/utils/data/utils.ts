// --- Types ---
import { LocalStorageData, LocalStorageAnyObj } from 'src/types';

/**
 * @notice Sync the response from `callback` with localStorage (get/set)
 *
 * @param {string} key This is where the data is stored in localStorage
 * @param {Object} meta Additional context to save alongside the data
 * @param {fn} callback Function to fetch/return data
 */
export async function syncStorage(
  key: string,
  meta: LocalStorageAnyObj,
  callback: (
    localStorageData?: LocalStorageData,
    save?: (saveData?: LocalStorageAnyObj) => void
  ) => Promise<LocalStorageAnyObj>
) {
  // allow callback to mark shouldSave
  let altSave = undefined;
  let shouldSave = undefined;
  // retrieve state from localStorage
  const localStorageData: LocalStorageData | undefined = getStorage(key);
  // check for updates
  // - `callback` is passed a `localStorageData` object (the current state) and a `save` fn
  // - `callback` should return an Object which syncStorage will return as response
  // - `callback` may call `save` and pass in an alternative object to save into localStorage
  const data = await callback(localStorageData, (saveData?) => ((shouldSave = true), (altSave = saveData)));
  // save new state
  if (shouldSave) {
    // merge data with meta and store into storage mechanism (localStorage)
    setStorage(key, {
      ...meta,
      data: altSave || data,
    });
  }

  // returns the response from callback
  return data;
}

/**
 * @notice Get stored data at given key
 */
export function getStorage(key: string) {
  const rawLocalStorageData: string | null = localStorage.getItem(key);

  return rawLocalStorageData ? JSON.parse(rawLocalStorageData) : undefined;
}

/**
 * @notice Save new data to the given key
 */
export function setStorage(key: string, value: LocalStorageData) {
  localStorage.setItem(key, JSON.stringify(value));
}
