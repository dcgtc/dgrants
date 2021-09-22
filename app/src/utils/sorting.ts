import { BigNumber } from '@ethersproject/bignumber';
import { SortingMode } from 'src/types';

// Compare two big numbers.
export const bigNumberComparator = (a: BigNumber, b: BigNumber, mode: SortingMode = 'ascending') => {
  if (mode === 'random') {
    return Math.random() < 0.5 ? -1 : 1;
  }

  const isReverse = mode === 'descending';

  if (a.lt(b)) {
    return isReverse ? 1 : -1;
  } else if (a.gt(b)) {
    return isReverse ? -1 : 1;
  } else {
    return 0;
  }
};
