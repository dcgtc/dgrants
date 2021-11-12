/**
 * @dev This file was copy/pasted from the mainnet equivalent of this file, which is GrantRoundManager.test.ts
 * These tests are run separately using `yarn test:polygon`
 *
 * @dev If you are writing tests and the test times out during a call to `donate`, this is likely because:
 *     1. The Uniswap pool or path you are using does not exist on mainnet, or
 *     2. There is not enough liquidity on mainnet for the specified amountIn
 */

// --- External imports ---
import { artifacts, ethers, waffle } from 'hardhat';
import { Artifact } from 'hardhat/types';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address';
import { deployMockContract } from '@ethereum-waffle/mock-contract';
import { MockContract } from 'ethereum-waffle';
import { expect } from 'chai';

// --- Our imports ---
import { ETH_ADDRESS, WETH_ADDRESS, UNISWAP_FACTORY, tokensPolygon as tokens, approve, balanceOf, setBalance, encodeRoutePolygon, getSwapAmountOut } from '../utils'; // prettier-ignore
import { GrantRoundManagerUniV2 } from '../../typechain';
import { SwapSummaryUniV2, Donation } from '@dgrants/types';

// --- Parse and define helpers ---
const { isAddress, parseUnits } = ethers.utils;
const { deployContract } = waffle;
const randomAddress = () => ethers.Wallet.createRandom().address;
const WAD = parseUnits('1', 18);

// --- GrantRoundManagerUniV2 tests ---
describe('GrantRoundManagerUniV2', () => {
  let user: SignerWithAddress;
  let manager: GrantRoundManagerUniV2;
  let mockToken: MockContract;
  let mockRegistry: MockContract;

  before(async () => {
    [user] = await ethers.getSigners();

    // Deploy mock contracts
    mockRegistry = await deployMockContract(user, artifacts.readArtifactSync('GrantRegistry').abi);
    mockToken = await deployMockContract(user, ['function totalSupply() returns(uint256)']);
    await mockRegistry.mock.grantCount.returns('2');
    await mockToken.mock.totalSupply.returns('0');

    // Deploy Manager
    const managerArtifact: Artifact = await artifacts.readArtifact('GrantRoundManagerUniV2');
    manager = <GrantRoundManagerUniV2>(
      await deployContract(user, managerArtifact, [mockRegistry.address, tokens.dai.address])
    );
  });

  describe('constructor', () => {
    it('deploys properly', async () => {
      // Verify deploy
      expect(isAddress(manager.address), 'Failed to deploy GrantRoundManager').to.be.true;

      // Verify constructor parameters
      expect(await manager.registry()).to.equal(mockRegistry.address);
      expect(await manager.donationToken()).to.equal(tokens.dai.address);
    });

    it('reverts when deploying with an invalid grant registry', async () => {
      // Test that deployment fails if provided Registry address has no code
      const managerArtifact: Artifact = await artifacts.readArtifact('GrantRoundManager');
      await expect(
        deployContract(user, managerArtifact, [randomAddress(), tokens.dai.address, UNISWAP_FACTORY, WETH_ADDRESS])
      ).to.be.revertedWith('function call to a non-contract account');
    });

    it('reverts when deploying with an invalid donation token', async () => {
      // First we test a donation token address that has no code
      const managerArtifact: Artifact = await artifacts.readArtifact('GrantRoundManager');
      await expect(
        deployContract(user, managerArtifact, [mockRegistry.address, randomAddress(), UNISWAP_FACTORY, WETH_ADDRESS])
      ).to.be.revertedWith('function call to a non-contract account');

      // Now we test a donation token that has no supply
      await mockToken.mock.totalSupply.returns('0');
      await expect(
        deployContract(user, managerArtifact, [mockRegistry.address, mockToken.address, UNISWAP_FACTORY, WETH_ADDRESS])
      ).to.be.revertedWith('GrantRoundManager: Invalid token');
    });
  });

  describe('createGrantRound', () => {
    let mockMatchingToken: MockContract;
    // Create round
    const metadataAdmin = randomAddress();
    const payoutAdmin = randomAddress();
    const startTime = '50000000000000'; // random timestamp far in the future
    const endTime = '60000000000000'; // random timestamp far in the future
    const metaPtr = { protocol: 1, pointer: 'QmPMERYmqZtbHmqd2UzRhX9F4cixnMQU2GFa2hYAsQ6J3D' }; // dummy data

    beforeEach(async () => {
      mockMatchingToken = await deployMockContract(user, ['function totalSupply() returns(uint256)']);
    });

    it('creates new grant rounds', async () => {
      // Create a valid token supply
      await mockMatchingToken.mock.totalSupply.returns('100');
      const tx = await manager.createGrantRound(
        metadataAdmin,
        payoutAdmin,
        mockMatchingToken.address,
        startTime,
        endTime,
        metaPtr
      );

      // Verify event log was emitted
      await expect(tx).to.emit(manager, 'GrantRoundCreated');

      // Parse data from the event to get the address of the new GrantRound
      const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
      const log = manager.interface.parseLog(receipt.logs[0]);
      const { grantRound: grantRoundAddress } = log.args;

      // Verify GrantRound was properly created
      const grantRound = await ethers.getContractAt('GrantRound', grantRoundAddress);
      expect(await grantRound.metadataAdmin()).to.equal(metadataAdmin);
      expect(await grantRound.payoutAdmin()).to.equal(payoutAdmin);
      expect(await grantRound.donationToken()).to.equal(tokens.dai.address);
      expect(await grantRound.matchingToken()).to.equal(mockMatchingToken.address);
      expect(await grantRound.startTime()).to.equal(startTime);
      expect(await grantRound.endTime()).to.equal(endTime);

      const roundMetaPtr = await grantRound.metaPtr();
      expect(roundMetaPtr.protocol).to.equal(metaPtr.protocol);
      expect(roundMetaPtr.pointer).to.equal(metaPtr.pointer);
    });

    it('reverts when creating a round with an invalid matching token', async () => {
      await mockMatchingToken.mock.totalSupply.returns('0');
      await expect(
        manager.createGrantRound(metadataAdmin, payoutAdmin, mockMatchingToken.address, startTime, endTime, metaPtr)
      ).to.be.revertedWith('GrantRoundManager: Invalid matching token');
    });
  });

  describe('donate', () => {
    let mockRound: MockContract;
    let swap: SwapSummaryUniV2;
    let donation: Donation;
    let payee1: string, payee2: string; // addresses grant owners receive donations to
    const deadline = '10000000000'; // date of 2286-11-20 as swap deadline

    beforeEach(async () => {
      // Deploy a mock GrantRound
      mockRound = await deployMockContract(user, artifacts.readArtifactSync('GrantRound').abi);
      await mockRound.mock.donationToken.returns(tokens.dai.address);
      await mockRound.mock.isActive.returns(true);
      await mockRound.mock.registry.returns(mockRegistry.address);

      // Set payee address to be a random address
      payee1 = randomAddress();
      payee2 = randomAddress();
      await mockRegistry.mock.getGrantPayee.withArgs('0').returns(payee1);
      await mockRegistry.mock.getGrantPayee.withArgs('1').returns(payee2);

      // Configure default donation data
      swap = { amountIn: '1', amountOutMin: '0', path: await encodeRoutePolygon(['usdc', 'eth', 'dai']) };
      donation = { grantId: 0, token: tokens.usdc.address, ratio: parseUnits('1', 18), rounds: [mockRound.address] };

      // Fund the first user with tokens and approve the manager
      await setBalance('dai', user.address, parseUnits('1000', 18));
      await setBalance('usdc', user.address, parseUnits('1000', 18));
      await setBalance('weth', user.address, parseUnits('1000', 18));
    });

    afterEach(async () => {
      // Manager should not hold tokens after a swap, but sometimes there is dust, so we check to ensure only dust
      // remains. So far the highest seen left is 4 wei, so we check for 5 wei or less
      const dust = ethers.BigNumber.from('5');
      expect(await balanceOf('dai', manager.address)).to.be.lte(dust);
      expect(await balanceOf('usdc', manager.address)).to.be.lte(dust);
      expect(await balanceOf('weth', manager.address)).to.be.lte(dust);
      expect(await balanceOf('eth', manager.address)).to.be.lte(dust);
    });

    describe('validations', () => {
      it('reverts if an invalid grant ID is provided', async () => {
        await expect(manager.donate([swap], deadline, [{ ...donation, grantId: '500' }])).to.be.revertedWith(
          'GrantRoundManager: Grant does not exist in registry'
        );
      });

      it('reverts if a provided grant round has a different donation token than the GrantRoundManager', async () => {
        await mockRound.mock.donationToken.returns(ETH_ADDRESS);
        await expect(manager.donate([swap], deadline, [{ ...donation }])).to.be.revertedWith(
          "GrantRoundManager: GrantRound's donation token does not match GrantRoundManager's donation token"
        );
      });

      it('reverts if a provided grant round is not active', async () => {
        await mockRound.mock.isActive.returns(false);
        await expect(manager.donate([swap], deadline, [{ ...donation }])).to.be.revertedWith(
          'GrantRoundManager: GrantRound is not active'
        );
      });

      it('reverts if a token is listed twice in the swaps input', async () => {
        const swaps = [
          { amountIn: 1, amountOutMin: '0', path: [tokens.dai.address] },
          { amountIn: 1, amountOutMin: '0', path: [tokens.dai.address] },
        ];
        const donations = [
          { grantId: 0, token: tokens.dai.address, ratio: parseUnits('1', 18), rounds: [mockRound.address] },
        ];
        await approve('usdc', user, manager.address);
        await expect(manager.donate(swaps, deadline, donations)).to.be.revertedWith(
          'GrantRoundManager: Swap parameter has duplicate input tokens'
        );
      });

      it('reverts if swap and donate inputs result in zero donation', async () => {
        const swaps = [{ amountIn: 1, amountOutMin: '0', path: [tokens.dai.address] }];
        const donations = [
          { grantId: 0, token: tokens.dai.address, ratio: parseUnits('0.25', 18), rounds: [mockRound.address] },
          { grantId: 1, token: tokens.dai.address, ratio: parseUnits('0.75', 18), rounds: [mockRound.address] },
        ];
        await approve('usdc', user, manager.address);
        await expect(manager.donate(swaps, deadline, donations)).to.be.revertedWith(
          'GrantRoundManager: Donation amount must be greater than zero'
        );
      });

      it('reverts if donation ratios for a token do not sum to 100%', async () => {
        const swaps = [{ amountIn: parseUnits('1', 18), amountOutMin: '0', path: [tokens.dai.address] }];
        const donations = [
          { grantId: 0, token: tokens.dai.address, ratio: parseUnits('0.25', 18), rounds: [mockRound.address] },
          { grantId: 1, token: tokens.dai.address, ratio: parseUnits('0.50', 18), rounds: [mockRound.address] },
        ];
        await approve('dai', user, manager.address);
        await expect(manager.donate(swaps, deadline, donations)).to.be.revertedWith(
          'GrantRoundManager: Ratios do not sum to 100%'
        );
      });
    });

    describe('one donation', () => {
      it('input token DAI, output token DAI', async () => {
        const amountIn = parseUnits('100', 18);
        expect(await balanceOf('dai', payee1)).to.equal('0');
        await approve('dai', user, manager.address);
        await manager.donate([{ ...swap, path: [tokens.dai.address], amountIn }], deadline, [
          { ...donation, token: tokens.dai.address },
        ]);
        expect(await balanceOf('dai', payee1)).to.equal(amountIn);
      });

      it('input token ETH, output token DAI', async () => {
        const amountIn = parseUnits('10', 18);
        const tx = await manager.donate(
          [{ ...swap, amountIn, path: await encodeRoutePolygon(['eth', 'dai']) }],
          deadline,
          [{ ...donation, token: tokens.weth.address }],
          { value: amountIn, gasPrice: '0' } // zero gas price to make balance checks simpler
        );

        // Get the donationAmount from the swap from the GrantDonation log
        const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
        const log = manager.interface.parseLog(receipt.logs[receipt.logs.length - 2]); // event we want is second to last event emitted
        const { donationAmount } = log.args;
        expect(await balanceOf('dai', payee1)).to.equal(donationAmount);
      });

      // NOTE: Skipping the below test since this is currently not supported for Polygon
      it.skip('input token WETH, output token DAI', async () => {
        const amountIn = parseUnits('10', 18);
        await approve('weth', user, manager.address);
        const tx = await manager.donate(
          [{ ...swap, amountIn, path: await encodeRoutePolygon(['weth', 'dai']) }],
          deadline,
          [{ ...donation, token: tokens.weth.address }]
        );

        // Get the donationAmount from the swap from the GrantDonation log
        const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
        const log = manager.interface.parseLog(receipt.logs[receipt.logs.length - 2]); // event we want is second to last event emitted
        const { donationAmount } = log.args;
        expect(await balanceOf('dai', payee1)).to.equal(donationAmount);
      });

      it('input token USDC, output token DAI, swap passes through ETH', async () => {
        // Execute donation to the payee
        const amountIn = parseUnits('100', 18);
        await approve('dai', user, manager.address);
        const tx = await manager.donate([{ ...swap, amountIn }], deadline, [donation]);

        // Get the donationAmount from the swap from the GrantDonation log
        const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
        const log = manager.interface.parseLog(receipt.logs[receipt.logs.length - 2]); // event we want is second to last event emitted
        const { donationAmount } = log.args;
        expect(await balanceOf('dai', payee1)).to.equal(donationAmount);
      });

      it('allows donations without specifying any rounds', async () => {
        const amountIn = parseUnits('100', 18);
        expect(await balanceOf('dai', payee1)).to.equal('0');
        await approve('dai', user, manager.address);
        await manager.donate([{ ...swap, path: [tokens.dai.address], amountIn }], deadline, [
          { ...donation, token: tokens.dai.address, rounds: [] },
        ]);
        expect(await balanceOf('dai', payee1)).to.equal(amountIn);
      });

      it('emits a log on a successful donation', async () => {
        // Execute donation to the payee using DAI as input
        const amountIn = parseUnits('100', 18);
        await approve('dai', user, manager.address);
        const tx = await manager.donate([{ ...swap, path: [tokens.dai.address], amountIn }], deadline, [
          { ...donation, token: tokens.dai.address },
        ]);
        const now = (await ethers.provider.getBlock('latest')).timestamp;
        await expect(tx)
          .to.emit(manager, 'GrantDonation')
          .withArgs('0', tokens.dai.address, amountIn, [mockRound.address], now);
      });
    });

    describe('bulk donation, single token', () => {
      it('input token DAI, output token DAI', async () => {
        // No swap, just batch transfers
        const swaps = [{ amountIn: parseUnits('100', 18), amountOutMin: '0', path: [tokens.dai.address] }];
        const donations = [
          { grantId: 0, token: tokens.dai.address, ratio: parseUnits('0.25', 18), rounds: [mockRound.address] },
          { grantId: 1, token: tokens.dai.address, ratio: parseUnits('0.75', 18), rounds: [mockRound.address] },
        ];

        await approve('dai', user, manager.address);
        await manager.donate(swaps, deadline, donations);

        const expectedBalancePayee1 = swaps[0].amountIn.mul(donations[0].ratio).div(WAD);
        const expectedBalancePayee2 = swaps[0].amountIn.mul(donations[1].ratio).div(WAD);
        expect(await balanceOf('dai', payee1)).to.equal(expectedBalancePayee1);
        expect(await balanceOf('dai', payee2)).to.equal(expectedBalancePayee2);
      });

      it('input token ETH, output token DAI', async () => {
        const swaps = [
          { amountIn: parseUnits('1', 18), amountOutMin: '0', path: await encodeRoutePolygon(['eth', 'dai']) },
        ];
        const donations = [
          { grantId: 0, token: tokens.weth.address, ratio: parseUnits('0.25', 18), rounds: [mockRound.address] },
          { grantId: 1, token: tokens.weth.address, ratio: parseUnits('0.75', 18), rounds: [mockRound.address] },
        ];
        const tx = await manager.donate(swaps, deadline, donations, { value: swaps[0].amountIn, gasPrice: '0' });

        const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
        const amountOut = getSwapAmountOut(receipt.logs);
        const expectedBalancePayee1 = amountOut.mul(donations[0].ratio).div(WAD);
        const expectedBalancePayee2 = amountOut.mul(donations[1].ratio).div(WAD);
        expect(await balanceOf('dai', payee1)).to.equal(expectedBalancePayee1);
        expect(await balanceOf('dai', payee2)).to.equal(expectedBalancePayee2);
      });

      it('input token USDC, output token DAI, swap passes through ETH', async () => {
        const path = await encodeRoutePolygon(['usdc', 'eth', 'dai']);
        const swaps = [{ amountIn: parseUnits('1000', 18), amountOutMin: '0', path }];
        const donations = [
          { grantId: 0, token: tokens.usdc.address, ratio: parseUnits('0.25', 18), rounds: [mockRound.address] },
          { grantId: 1, token: tokens.usdc.address, ratio: parseUnits('0.75', 18), rounds: [mockRound.address] },
        ];
        await approve('dai', user, manager.address);
        const tx = await manager.donate(swaps, deadline, donations);

        const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
        const amountOut = getSwapAmountOut(receipt.logs);
        const expectedBalancePayee1 = amountOut.mul(donations[0].ratio).div(WAD);
        const expectedBalancePayee2 = amountOut.mul(donations[1].ratio).div(WAD);
        expect(await balanceOf('dai', payee1)).to.equal(expectedBalancePayee1);
        expect(await balanceOf('dai', payee2)).to.equal(expectedBalancePayee2);
      });

      it('input tokens DAI, ETH, USDC', async () => {
        // Configure swaps and donations
        const swaps = [
          {
            amountIn: parseUnits('1000', 18),
            amountOutMin: '0',
            path: await encodeRoutePolygon(['usdc', 'eth', 'dai']),
          },
          { amountIn: parseUnits('1', 18), amountOutMin: '0', path: await encodeRoutePolygon(['eth', 'dai']) },
          { amountIn: parseUnits('100', 18), amountOutMin: '0', path: [tokens.dai.address] },
        ];
        const donations = [
          { grantId: 0, token: tokens.usdc.address, ratio: parseUnits('0.10', 18), rounds: [mockRound.address] },
          { grantId: 1, token: tokens.usdc.address, ratio: parseUnits('0.90', 18), rounds: [mockRound.address] },
          { grantId: 2, token: tokens.weth.address, ratio: parseUnits('0.20', 18), rounds: [mockRound.address] },
          { grantId: 3, token: tokens.weth.address, ratio: parseUnits('0.80', 18), rounds: [mockRound.address] },
          { grantId: 4, token: tokens.dai.address, ratio: parseUnits('0.30', 18), rounds: [mockRound.address] },
          { grantId: 5, token: tokens.dai.address, ratio: parseUnits('0.70', 18), rounds: [mockRound.address] },
        ];

        // Configure mocks
        await mockRegistry.mock.grantCount.returns(donations.length); // ensure mock registry has enough grants
        const payees = [...Array(donations.length)].map(() => randomAddress()); // array of random payee addresses
        await Promise.all(
          donations.map(async (donation) => {
            await mockRegistry.mock.getGrantPayee.withArgs(donation.grantId).returns(payees[donation.grantId]);
          })
        );

        // Execute donations
        await approve('dai', user, manager.address);
        await approve('usdc', user, manager.address);
        const tx = await manager.donate(swaps, deadline, donations, { value: parseUnits('1', 18) });

        // Verify DAI outputs
        expect(await balanceOf('dai', payees[4])).to.equal(swaps[2].amountIn.mul(donations[4].ratio).div(WAD));
        expect(await balanceOf('dai', payees[5])).to.equal(swaps[2].amountIn.mul(donations[5].ratio).div(WAD));

        // Verify ETH and USDC amounts, by parsing swap logs manually (i.e. hardcoding the appropriate indexes)
        const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
        const usdcToDaiAmountOut = getSwapAmountOut([receipt.logs[9]]);
        const ethToDaiAmountOut = getSwapAmountOut([receipt.logs[14]]);

        expect(await balanceOf('dai', payees[0])).to.equal(usdcToDaiAmountOut.mul(donations[0].ratio).div(WAD));
        expect(await balanceOf('dai', payees[1])).to.equal(usdcToDaiAmountOut.mul(donations[1].ratio).div(WAD));
        expect(await balanceOf('dai', payees[2])).to.equal(ethToDaiAmountOut.mul(donations[2].ratio).div(WAD));
        expect(await balanceOf('dai', payees[3])).to.equal(ethToDaiAmountOut.mul(donations[3].ratio).div(WAD));
      });

      it('emits a log for each successful donation', async () => {
        const swaps = [
          { amountIn: parseUnits('1', 18), amountOutMin: '0', path: await encodeRoutePolygon(['eth', 'dai']) },
        ];
        const donations = [
          { grantId: 0, token: tokens.weth.address, ratio: parseUnits('0.25', 18), rounds: [mockRound.address] },
          { grantId: 1, token: tokens.weth.address, ratio: parseUnits('0.75', 18), rounds: [mockRound.address] },
        ];
        const tx = await manager.donate(swaps, deadline, donations, { value: swaps[0].amountIn, gasPrice: '0' });

        // Chai event matcher uses last log when there's multiple logs of the same name
        const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
        const amountOut = getSwapAmountOut(receipt.logs);
        const expectedBalancePayee2 = amountOut.mul(donations[1].ratio).div(WAD);
        const now = (await ethers.provider.getBlock('latest')).timestamp;
        await expect(tx)
          .to.emit(manager, 'GrantDonation')
          .withArgs('1', tokens.weth.address, expectedBalancePayee2, [mockRound.address], now);

        // Also verify number of GrantDonation events
        const grantDonationTopic = manager.interface.getEventTopic('GrantDonation');
        const grantDonationLogs = receipt.logs.filter((log) => log.topics[0] === grantDonationTopic);
        expect(grantDonationLogs.length).to.equal(donations.length);
      });
    });
  });
});
