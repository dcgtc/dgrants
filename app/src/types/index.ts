// App-specific type definition go here
export type CartItemOptions = {
  grantId: string;
  contributionTokenAddress: string; // store address instead of TokenInfo to reduce localStorage size used
  contributionAmount: string;
};
