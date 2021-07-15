// --- External imports ---
import { artifacts, ethers, waffle } from 'hardhat';
import { BigNumber, BigNumberish } from 'ethers';
import { Artifact } from 'hardhat/types';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address';
import { expect } from 'chai';

// --- Our imports ---
import { GrantRegistry } from '../typechain/GrantRegistry';
import { expectEqualGrants } from './utils';

// --- Parse and define helpers ---
const { deployContract } = waffle;
const { isAddress } = ethers.utils;
const randomAddress = () => ethers.Wallet.createRandom().address;
const randomPtr = () => String(Math.random()); // doesn't need to be a valid URL for testing
const BN = (x: BigNumberish) => BigNumber.from(x);

// --- GrantRegistry tests ---
describe('GrantRegistry', function () {
  let deployer: SignerWithAddress, user1: SignerWithAddress, user2: SignerWithAddress;
  let registry: GrantRegistry;

  // Helper method to create a grant and return the data used to create it
  async function createGrant(owner: string, payee: string, metaPtr: string, user?: SignerWithAddress) {
    user = user ? user : deployer; // if a signer, `user`, is not specified we use the `deployer` account
    await registry.connect(user).createGrant(owner, payee, metaPtr);
    return { owner, payee, metaPtr };
  }

  beforeEach(async () => {
    [deployer, user1, user2] = await ethers.getSigners();

    const grantRegistryArtifact: Artifact = await artifacts.readArtifact('GrantRegistry');
    registry = <GrantRegistry>await deployContract(deployer, grantRegistryArtifact);
  });

  describe('Initialization', () => {
    it('deploys properly', async function () {
      expect(isAddress(registry.address), 'Failed to deploy GrantRegistry').to.be.true;
      expect(await registry.grantCount()).to.equal('0');
    });
  });

  describe('Create Grants', () => {
    it('creates new grants', async function () {
      // Test first grant
      const { owner, payee, metaPtr } = await createGrant(user1.address, randomAddress(), randomPtr());
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
      const [owner, payee, metaPtr] = [user1.address, randomAddress(), randomPtr()];
      await expect(registry.createGrant(owner, payee, metaPtr))
        .to.emit(registry, 'GrantCreated')
        .withArgs(0, owner, payee, metaPtr);
    });
  });

  describe('Update Grants', () => {
    // Define initial grant parameters
    const id = BN(0);
    let owner: string; // need to set in beforeEach hook (user1 is undefined here)
    const payee = randomAddress();
    const metaPtr = randomPtr();

    beforeEach(async () => {
      // Create grant with user1
      owner = user1.address;
      await createGrant(owner, payee, metaPtr, user1);
      expectEqualGrants(await registry.grants(0), { id, owner, payee, metaPtr });
    });

    it('reverts if unauthorized user tries to edit a grant', async () => {
      const registryUser2 = await registry.connect(user2); // instance of registry contract with `user1` as signer
      await expect(registryUser2.updateGrantOwner(id, owner)).to.be.revertedWith('Not authorized');
      await expect(registryUser2.updateGrantPayee(id, payee)).to.be.revertedWith('Not authorized');
      await expect(registryUser2.updateGrantMetaPtr(id, metaPtr)).to.be.revertedWith('Not authorized');
      await expect(registryUser2.updateGrant(id, owner, payee, metaPtr)).to.be.revertedWith('Not authorized');
    });

    it('lets owner update owner', async () => {
      const newOwner = randomAddress();
      const registryUser = await registry.connect(user1); // instance of registry contract with `user1` as signer
      const tx = await registryUser.updateGrantOwner(id, newOwner);
      expectEqualGrants(await registry.grants(0), { id, owner: newOwner, payee, metaPtr });
      await expect(tx).to.emit(registry, 'GrantUpdated').withArgs(id, newOwner, payee, metaPtr);
    });

    it('lets owner update payee', async () => {
      const newPayee = randomAddress();
      const registryUser = await registry.connect(user1); // instance of registry contract with `user1` as signer
      const tx = await registryUser.updateGrantPayee(id, newPayee);
      expectEqualGrants(await registry.grants(0), { id, owner, payee: newPayee, metaPtr });
      await expect(tx).to.emit(registry, 'GrantUpdated').withArgs(id, owner, newPayee, metaPtr);
    });

    it('lets owner update metadata pointer', async () => {
      const newMetaPtr = randomPtr();
      const registryUser = await registry.connect(user1); // instance of registry contract with `user1` as signer
      const tx = await registryUser.updateGrantMetaPtr(id, newMetaPtr);
      expectEqualGrants(await registry.grants(0), { id, owner, payee, metaPtr: newMetaPtr });
      await expect(tx).to.emit(registry, 'GrantUpdated').withArgs(id, owner, payee, newMetaPtr);
    });

    it('lets owner update all grant fields at once', async () => {
      const newGrant = { id: BN(0), owner: randomAddress(), payee: randomAddress(), metaPtr: randomPtr() };
      const registryUser = await registry.connect(user1); // instance of registry contract with `user1` as signer
      const tx = await registryUser.updateGrant(id, newGrant.owner, newGrant.payee, newGrant.metaPtr);
      expectEqualGrants(await registry.grants(0), newGrant);
      await expect(tx)
        .to.emit(registry, 'GrantUpdated')
        .withArgs(newGrant.id, newGrant.owner, newGrant.payee, newGrant.metaPtr);
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
    it('returns grant status', async () => {
      const { owner: o1, payee: p1, metaPtr: m1 } = await createGrant(randomAddress(), randomAddress(), randomPtr());
      const data = [{ id: BN(0), owner: o1, payee: p1, metaPtr: m1 }];

      data.map(async (grant, index) => {
        let grantStatus = await registry.isGrantInRegistry(grant.id);
        expect(grantStatus).to.be.true;

        if (index == data.length - 1) {
          // Supply a non-existent grant id
          grantStatus = await registry.isGrantInRegistry(BN(index + 1));
          expect(grantStatus).to.be.false;
        }
      });
    });
    it('returns grant payee', async () => {
      const { owner: o1, payee: p1, metaPtr: m1 } = await createGrant(randomAddress(), randomAddress(), randomPtr());
      const data = [{ id: BN(0), owner: o1, payee: p1, metaPtr: m1 }];

      data.map(async (grant, _) => {
        const payee = await registry.getGrantPayee(grant.id);
        expect(payee).to.equal(grant.payee);
      });
    });
  });
});
