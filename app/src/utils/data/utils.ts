// --- Types ---
import { LocalStorageData, LocalStorageAnyObj } from 'src/types';
import * as localForage from 'localforage';

/**
 * @notice Default localForage instance
 */
export const DefaultStorage = getStorage({
  name: 'dGrants',
  version: 1,
});

/**
 * @notice Sync the response from `callback` with localStorage (get/set)
 *
 * @param {string} key This is where the data is stored in localStorage
 * @param {Object} meta Additional context to save alongside the data
 * @param {fn} callback Function to fetch/return data
 * @param {LocalForage} useStorage The storage we want to use in this sync call
 */
export async function syncStorage(
  key: string,
  meta: LocalStorageAnyObj,
  callback: (
    localStorageData?: LocalStorageData,
    save?: (saveData?: LocalStorageAnyObj) => void
  ) => Promise<LocalStorageAnyObj>,
  useStorage?: LocalForage
) {
  // allow callback to mark shouldSave
  let altData = undefined;
  let shouldSave = undefined;
  // retrieve state from localStorage
  const localStorageData = await getStorageKey(key, useStorage);
  // check for updates
  // - `callback` is passed a `localStorageData` object (the current state) and a `save` fn
  // - `callback` should return an Object which syncStorage will return as response
  // - `callback` may call `save` and pass in an alternative object to save into localStorage
  const data = await callback(localStorageData, (saveData?) => ((shouldSave = true), (altData = saveData)));
  // save new state
  if (shouldSave) {
    // merge data with meta and store into storage mechanism (localStorage)
    await setStorageKey(
      key,
      {
        ...meta,
        data: altData || data,
      },
      useStorage
    );
  }

  // returns the response from callback
  return data;
}

/**
 * @notice Get a new instance of localForage with the given config
 */
export function getStorage(config: LocalForageOptions) {
  return localForage.createInstance(config);
}

/**
 * @notice Get stored data at given key
 */
export async function getStorageKey(key: string, useStorage?: LocalForage) {
  return (await (useStorage || DefaultStorage).getItem(key)) as LocalStorageData | undefined;
}

/**
 * @notice Save new data to the given key
 */
export async function setStorageKey(key: string, value: LocalStorageData, useStorage?: LocalForage) {
  return await (useStorage || DefaultStorage).setItem(key, value);
}
