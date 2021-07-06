import hre, { ethers } from 'hardhat';
const { isAddress } = ethers.utils;
import { Artifact } from 'hardhat/types';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address';
import { expect } from 'chai';

import { GrantRounds } from '../typechain/GrantRounds';

const { deployContract } = hre.waffle;

const EMPTY_BYTES32 = '0x0000000000000000000000000000000000000000000000000000000000000000';

describe('GrantRounds', function () {
  let owner: SignerWithAddress;
  let round: GrantRounds;

  before(async () => {
    [owner] = await hre.ethers.getSigners();

    const grantRoundsArtifact: Artifact = await hre.artifacts.readArtifact('GrantRounds');
    round = <GrantRounds>await deployContract(owner, grantRoundsArtifact, [owner.address, EMPTY_BYTES32, '']);
  });

  it('should be properly deployed', async function () {
    expect(isAddress(round.address), 'Failed to deploy GrantRounds').to.be.true;
  });
});
