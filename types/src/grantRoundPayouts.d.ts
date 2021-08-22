// Claim struct from MerkleGrantRoundPayout
export type Claim = {
  index: number;
  payee: string;
  amount: number;
  merkleProof: string[];
};
