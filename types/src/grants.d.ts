import { BigNumber } from 'ethers';

// --- Grants ---
// The output from ethers/typechain allows array or object access to grant data, so we must define types for
// handling the Grant struct as done below
export type GrantObject = {
  id: BigNumber;
  owner: string;
  payee: string;
  metaPtr: string;
};
export type GrantArray = [BigNumber, string, string, string];
export type GrantEthers = GrantArray & GrantObject;
export type Grant = GrantObject | GrantEthers;

// Metadata resolve from a grant's metadata pointer URL
export type GrantMetadata = {
  name: string;
  description: string;
  logoURI?: string;
  properties: {
    projectWebsite: string;
    projectGithub: string;
    twitterHandle: string;
  };
};
export type GrantMetadataStatus = 'resolved' | 'pending' | 'error';
export type GrantMetadataResolution = Partial<GrantMetadata> & { status: GrantMetadataStatus };
