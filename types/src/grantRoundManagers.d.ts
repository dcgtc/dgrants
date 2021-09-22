import { BigNumberish, BytesLike } from 'ethers';

// SwapSummary struct from GrantRoundManager
export interface SwapSummary {
  amountIn: BigNumberish;
  amountOutMin: BigNumberish;
  path: BytesLike; // encoded swap path
}

// Donation struct from GrantRoundManager
export interface Donation {
  grantId: BigNumberish;
  token: string; // token address
  ratio: BigNumberish;
  rounds: string[];
}

// SwapSummary struct from GrantRoundManagerUniV2
export interface SwapSummaryUniV2 {
  amountIn: BigNumberish;
  amountOutMin: BigNumberish;
  path: string[]; // swap path as array of token addresses to pass through
}
