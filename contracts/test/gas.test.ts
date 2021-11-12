/**
 * @dev Gas snapshotting tests
 * source: https://gist.github.com/gakonst/258a6ccd6bb752248999a13e8dd82a64
 */

// --- External imports ---
import { artifacts, ethers, waffle } from 'hardhat';
import { Artifact } from 'hardhat/types';

// --- Our imports ---
import { approve, encodeRoute, setBalance, setNextBlockTimestamp, tokens, UNISWAP_FACTORY, WETH_ADDRESS } from './utils'; // prettier-ignore
import { snapshotGasCost } from './snapshotGasCost';
import { GrantRegistry, GrantRound, GrantRoundManager } from '../typechain';

// --- Parse and define helpers ---
const { parseUnits } = ethers.utils;
const { deployContract, loadFixture } = waffle;
const addr1 = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'; // hardhat account 0, but can be any address
const addr2 = '0x70997970c51812dc3a010c7d01b50e0d17dc79c8'; // hardhat account 1, but can be any address
const metaPtr1 = { protocol: 1, pointer: 'QmaHTgor7GhetW3nmev3UqabjrzbKJCe7q1v8Wfg3aZyV4' };
const metaPtr2 = { protocol: 1, pointer: 'QmeqiDZMA41ekPV9BJDx3VGtJbxU34YSS3oorLA8cPuib6' };

// --- Gas tests ---
describe('dGrants gas tests', () => {
  let registry: GrantRegistry;
  let round: GrantRound;
  let manager: GrantRoundManager;

  let startTime: number;
  let endTime: number;
  let deadline: number;

  // --- Fixture ---
  async function setup() {
    const [deployer, ...accounts] = await ethers.getSigners();

    // Deploy registry
    const grantRegistryArtifact: Artifact = await artifacts.readArtifact('GrantRegistry');
    const registry = <GrantRegistry>await deployContract(deployer, grantRegistryArtifact);

    // Deploy GrantRoundManager
    const managerArtifact: Artifact = await artifacts.readArtifact('GrantRoundManager');
    const manager = <GrantRoundManager>(
      await deployContract(deployer, managerArtifact, [
        registry.address,
        tokens.dai.address,
        UNISWAP_FACTORY,
        WETH_ADDRESS,
      ])
    );

    // Create Grant Round
    startTime = (await ethers.provider.getBlock('latest')).timestamp + 100; // use block timestamp over `new Date()` because prior tests may have fast-forwarded time
    endTime = startTime + 86400; // one day later
    deadline = endTime;
    const tx = await manager.createGrantRound(addr1, addr1, tokens.dai.address, startTime, endTime, metaPtr1);
    const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
    const log = manager.interface.parseLog(receipt.logs[0]);
    const { grantRound: grantRoundAddress } = log.args;
    const round = <GrantRound>await ethers.getContractAt('GrantRound', grantRoundAddress);

    // Create Grants
    await registry.createGrant(deployer.address, deployer.address, metaPtr1); // grant ID 0, used for update tests
    await registry.createGrant(accounts[0].address, accounts[0].address, metaPtr1);
    await registry.createGrant(accounts[1].address, accounts[1].address, metaPtr1);
    await registry.createGrant(accounts[2].address, accounts[2].address, metaPtr1);
    await registry.createGrant(accounts[3].address, accounts[3].address, metaPtr1);

    // Fund `deployer`, which is the account that sends the test transactions
    await setBalance('dai', deployer.address, parseUnits('1000', 18));
    await setBalance('gtc', deployer.address, parseUnits('1000', 18));
    await approve('dai', deployer, manager.address);
    await approve('gtc', deployer, manager.address);

    // Ensure round is active
    await setNextBlockTimestamp(startTime);

    return { registry, manager, round };
  }

  beforeEach(async () => {
    ({ registry, manager, round } = await loadFixture(setup));
  });

  // --- GrantRegistry snapshot tests ---
  describe('GrantRegistry', () => {
    it('createGrant', async () => {
      await snapshotGasCost(registry.createGrant(addr1, addr1, metaPtr1));
    });

    it('updateGrantOwner', async () => {
      await snapshotGasCost(registry.updateGrantOwner(0, addr2));
    });

    it('updateGrantPayee', async () => {
      await snapshotGasCost(registry.updateGrantPayee(0, addr2));
    });

    it('updateGrantMetaPtr', async () => {
      await snapshotGasCost(registry.updateGrantMetaPtr(0, metaPtr2));
    });

    it('updateGrantMetaPtr', async () => {
      await snapshotGasCost(registry.updateGrant(0, addr2, addr2, metaPtr2));
    });

    it('getGrantPayee', async () => {
      const abi = ['function getGrantPayee(uint96 _id) external returns (address)'];
      const [signer] = await ethers.getSigners();
      const _registry = new ethers.Contract(registry.address, abi, signer);
      await snapshotGasCost(_registry.getGrantPayee(0));
    });
  });

  // --- GrantRoundManager snapshot tests ---
  describe('GrantRoundManager', () => {
    it('createGrantRound', async () => {
      await snapshotGasCost(manager.createGrantRound(addr1, addr1, tokens.dai.address, startTime, endTime, metaPtr1));
    });

    describe('one donation', () => {
      const ratio = parseUnits('1', 18);

      it('input token DAI, output token DAI', async () => {
        const swap = { amountIn: parseUnits('100', 18), amountOutMin: '1', path: tokens.dai.address };
        const donation = { grantId: 1, token: tokens.dai.address, ratio, rounds: [round.address] };
        await snapshotGasCost(manager.donate([swap], deadline, [donation]));
      });

      it('input token ETH, output token DAI', async () => {
        const amountIn = parseUnits('1', 18);
        const swap = { amountIn, amountOutMin: '1', path: await encodeRoute(['eth', 'dai']) };
        const donation = { grantId: 1, token: tokens.weth.address, ratio, rounds: [round.address] };
        await snapshotGasCost(manager.donate([swap], deadline, [donation], { value: amountIn }));
      });

      it('input token GTC, output token DAI', async () => {
        const amountIn = parseUnits('10', 18);
        const swap = { amountIn, amountOutMin: '1', path: await encodeRoute(['gtc', 'eth', 'dai']) };
        const donation = { grantId: 1, token: tokens.gtc.address, ratio, rounds: [round.address] };
        await snapshotGasCost(manager.donate([swap], deadline, [donation]));
      });
    });

    describe('five donations', () => {
      it('input token DAI, output token DAI', async () => {
        const swap = { amountIn: parseUnits('100', 18), amountOutMin: '1', path: tokens.dai.address };
        const donations = [
          { grantId: 0, token: tokens.dai.address, ratio: parseUnits('0.04', 18), rounds: [round.address] },
          { grantId: 1, token: tokens.dai.address, ratio: parseUnits('0.06', 18), rounds: [round.address] },
          { grantId: 2, token: tokens.dai.address, ratio: parseUnits('0.15', 18), rounds: [round.address] },
          { grantId: 3, token: tokens.dai.address, ratio: parseUnits('0.25', 18), rounds: [round.address] },
          { grantId: 4, token: tokens.dai.address, ratio: parseUnits('0.50', 18), rounds: [round.address] },
        ];
        await snapshotGasCost(manager.donate([swap], deadline, donations));
      });

      it('input token ETH, output token DAI', async () => {
        const amountIn = parseUnits('1', 18);
        const swap = { amountIn, amountOutMin: '1', path: await encodeRoute(['eth', 'dai']) };
        const donations = [
          { grantId: 0, token: tokens.weth.address, ratio: parseUnits('0.04', 18), rounds: [round.address] },
          { grantId: 1, token: tokens.weth.address, ratio: parseUnits('0.06', 18), rounds: [round.address] },
          { grantId: 2, token: tokens.weth.address, ratio: parseUnits('0.15', 18), rounds: [round.address] },
          { grantId: 3, token: tokens.weth.address, ratio: parseUnits('0.25', 18), rounds: [round.address] },
          { grantId: 4, token: tokens.weth.address, ratio: parseUnits('0.50', 18), rounds: [round.address] },
        ];
        await snapshotGasCost(manager.donate([swap], deadline, donations, { value: amountIn }));
      });

      it('input token GTC, output token DAI', async () => {
        const amountIn = parseUnits('10', 18);
        const swap = { amountIn, amountOutMin: '1', path: await encodeRoute(['gtc', 'eth', 'dai']) };
        const donations = [
          { grantId: 0, token: tokens.gtc.address, ratio: parseUnits('0.04', 18), rounds: [round.address] },
          { grantId: 1, token: tokens.gtc.address, ratio: parseUnits('0.06', 18), rounds: [round.address] },
          { grantId: 2, token: tokens.gtc.address, ratio: parseUnits('0.15', 18), rounds: [round.address] },
          { grantId: 3, token: tokens.gtc.address, ratio: parseUnits('0.25', 18), rounds: [round.address] },
          { grantId: 4, token: tokens.gtc.address, ratio: parseUnits('0.50', 18), rounds: [round.address] },
        ];
        await snapshotGasCost(manager.donate([swap], deadline, donations));
      });
    });
  });
});
