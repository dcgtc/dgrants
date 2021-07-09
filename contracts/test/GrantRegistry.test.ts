import hre, { ethers } from 'hardhat';
const { isAddress } = ethers.utils;
import { Artifact } from 'hardhat/types';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address';
import { expect } from 'chai';

import { GrantRegistry } from '../typechain/GrantRegistry';

const { deployContract } = hre.waffle;

const EMPTY_BYTES32 = '0x0000000000000000000000000000000000000000000000000000000000000000';

describe('GrantRegistry', function () {
  let owner: SignerWithAddress;
  let registry: GrantRegistry;

  before(async () => {
    [owner] = await hre.ethers.getSigners();

    const grantRegistryArtifact: Artifact = await hre.artifacts.readArtifact('GrantRegistry');
    registry = <GrantRegistry>await deployContract(owner, grantRegistryArtifact, [EMPTY_BYTES32, '']);
  });

  it('should be properly deployed', async function () {
    expect(isAddress(registry.address), 'Failed to deploy GrantRegistry').to.be.true;
  });
});
