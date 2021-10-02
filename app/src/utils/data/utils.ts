// --- Types ---
import { LocalForageData, LocalForageAnyObj, LocalForageConfig } from 'src/types';
import { DefaultForageConfig } from 'src/utils/constants';
import * as localForage from 'localforage';

/**
 * @notice Default localForage instance
 */
export const DefaultStorage = getStorage(DefaultForageConfig);

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
  meta: LocalForageAnyObj,
  callback: (
    LocalForageData?: LocalForageData,
    save?: (saveData?: LocalForageAnyObj) => void
  ) => Promise<LocalForageAnyObj>,
  useStorage?: LocalForage
) {
  // retrieve state from localStorage
  const LocalForageData = await getStorageKey(key, useStorage);
  // pull the data
  let data = LocalForageData?.data;
  // allow callback to mark shouldSave
  let altData = undefined;
  let shouldSave = undefined;
  // check for updates
  // - `callback` is passed a `LocalForageData` object (the current state) and a `save` fn
  // - `callback` should return an Object which syncStorage will return as response
  // - `callback` may call `save` and pass in an alternative object to save into localStorage
  data = await callback(LocalForageData, (saveData?) => ((shouldSave = true), (altData = saveData)));
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
export function getStorage(config: LocalForageConfig) {
  return localForage.createInstance(config);
}

/**
 * @notice Get stored data at given key
 */
export async function getStorageKey(key: string, useStorage?: LocalForage) {
  return (await (useStorage || DefaultStorage).getItem(key)) as LocalForageData | undefined;
}

/**
 * @notice Save new data to the given key
 */
export async function setStorageKey(key: string, value: LocalForageData, useStorage?: LocalForage) {
  return await (useStorage || DefaultStorage).setItem(key, value);
}
