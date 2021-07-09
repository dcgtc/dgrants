// --- External imports ---
import { artifacts, ethers, waffle } from 'hardhat';
import { BigNumber, BigNumberish } from 'ethers';
import { Artifact } from 'hardhat/types';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address';
import { expect } from 'chai';

// --- Our imports ---
import { GrantRegistry } from '../typechain/GrantRegistry';

// --- Parse and define helpers ---
const { deployContract } = waffle;
const { isAddress } = ethers.utils;
const randomAddress = () => ethers.Wallet.createRandom().address;
const randomPtr = () => String(Math.random()); // doesn't need to be a valid URL for testing
const BN = (x: BigNumberish) => BigNumber.from(x);

// --- Type definitions ---
// The output from ethers/typechain allows array or object access to grant data, so we must define types for
// handling the Grant struct as done below
type GrantObject = {
  id: BigNumber;
  owner: string;
  payee: string;
  metaPtr: string;
};
type GrantArray = [BigNumber, string, string, string];
type GrantEthers = GrantArray & GrantObject;
type Grant = GrantObject | GrantEthers;

// --- GrantRegistry tests ---
describe('GrantRegistry', function () {
  let deployer: SignerWithAddress, user1: SignerWithAddress;
  let registry: GrantRegistry;

  // Helper method to create a grant and return the data used to create it
  async function createGrant(owner: string, payee: string, metaPtr: string) {
    await registry.createGrant(owner, payee, metaPtr);
    return { owner, payee, metaPtr };
  }

  // Helper method to verify that two Grant objects are equal
  function expectEqualGrants(grant1: Grant, grant2: Grant) {
    expect(grant1.id).to.equal(grant2.id);
    expect(grant1.owner).to.equal(grant2.owner);
    expect(grant1.payee).to.equal(grant2.payee);
    expect(grant1.metaPtr).to.equal(grant2.metaPtr);
  }

  beforeEach(async () => {
    [deployer, user1] = await ethers.getSigners();

    const grantRegistryArtifact: Artifact = await artifacts.readArtifact('GrantRegistry');
    registry = <GrantRegistry>await deployContract(deployer, grantRegistryArtifact);
  });

  describe('Initialization', () => {
    it('deploys properly', async function () {
      expect(isAddress(registry.address), 'Failed to deploy GrantRegistry').to.be.true;
      expect(await registry.grantCount()).to.equal('0');
    });
  });

  describe('Grant Creation', () => {
    it('creates new grants', async function () {
      // Test first grant
      const { owner, payee, metaPtr } = await createGrant(user1.address, randomAddress(), 'http://meta.com');
      const grantData = await registry.grants(0); // this is the first grant so has ID of 0
      expect(await registry.grantCount()).to.equal('1'); // 1 total grant
      expectEqualGrants(grantData, { id: BN(0), owner, payee, metaPtr });

      // Test more grants
      const { owner: o1, payee: p1, metaPtr: m1 } = await createGrant(randomAddress(), randomAddress(), randomPtr());
      const { owner: o2, payee: p2, metaPtr: m2 } = await createGrant(randomAddress(), randomAddress(), randomPtr());
      const { owner: o3, payee: p3, metaPtr: m3 } = await createGrant(randomAddress(), randomAddress(), randomPtr());
      expect(await registry.grantCount()).to.equal('4');
      // Verify data for each
      const grants = [
        { id: BN(1), owner: o1, payee: p1, metaPtr: m1 },
        { id: BN(2), owner: o2, payee: p2, metaPtr: m2 },
        { id: BN(3), owner: o3, payee: p3, metaPtr: m3 },
      ];
      await Promise.all(
        grants.map(async (grant) => {
          expectEqualGrants(grant, await registry.grants(grant.id));
        })
      );
    });

    it('logs when grant is created', async function () {
      const [owner, payee, metaPtr] = [user1.address, randomAddress(), 'http://meta.com'];
      await expect(registry.createGrant(owner, payee, metaPtr))
        .to.emit(registry, 'GrantCreated')
        .withArgs(0, owner, payee, metaPtr);
    });
  });

  describe('View methods', () => {
    it('exposes state variables as getters', async () => {
      // Try calling getters (calls will throw if they don't exist)
      expect(await registry.grantCount());
      expect(await registry.grants(0));
    });

    it('returns all grants', async () => {
      // No grants initially
      expect(await registry.getAllGrants()).to.have.length(0);

      // Create some grants
      const { owner: o1, payee: p1, metaPtr: m1 } = await createGrant(randomAddress(), randomAddress(), randomPtr());
      const { owner: o2, payee: p2, metaPtr: m2 } = await createGrant(randomAddress(), randomAddress(), randomPtr());
      const { owner: o3, payee: p3, metaPtr: m3 } = await createGrant(randomAddress(), randomAddress(), randomPtr());
      const grants = await registry.getAllGrants();
      expect(grants).to.have.length(3);

      // Verify data for each
      const data = [
        { id: BN(0), owner: o1, payee: p1, metaPtr: m1 },
        { id: BN(1), owner: o2, payee: p2, metaPtr: m2 },
        { id: BN(2), owner: o3, payee: p3, metaPtr: m3 },
      ];
      grants.map((grant, index) => {
        expectEqualGrants(grant, data[index]);
      });
    });

    it('returns some grants', async () => {
      // Check pathological case
      expect(await registry.getGrants(0, 0)).to.have.length(0);

      // Create some grants
      const { owner: o1, payee: p1, metaPtr: m1 } = await createGrant(randomAddress(), randomAddress(), randomPtr());
      const { owner: o2, payee: p2, metaPtr: m2 } = await createGrant(randomAddress(), randomAddress(), randomPtr());
      const { owner: o3, payee: p3, metaPtr: m3 } = await createGrant(randomAddress(), randomAddress(), randomPtr());
      const data = [
        { id: BN(0), owner: o1, payee: p1, metaPtr: m1 },
        { id: BN(1), owner: o2, payee: p2, metaPtr: m2 },
        { id: BN(2), owner: o3, payee: p3, metaPtr: m3 },
      ];

      // Re-check pathological case
      expect(await registry.getGrants(0, 0)).to.have.length(0);

      // Verify range [0,1)
      const grants01 = await registry.getGrants(0, 1);
      expect(grants01).to.have.length(1);
      grants01.map((grant, index) => {
        expectEqualGrants(grant, data[index]);
      });

      // Verify range [1, 3)
      const grants13 = await registry.getGrants(1, 3);
      expect(grants13).to.have.length(2);
      grants13.map((grant, index) => {
        expectEqualGrants(grant, data[index + 1]);
      });

      // Verify that `getGrants` and `getAllGrants` are equivalent
      const allGrants = await registry.getAllGrants();
      const someGrants = await registry.getGrants(0, await registry.grantCount());
      expect(allGrants).to.deep.equal(someGrants);
    });
  });
});
