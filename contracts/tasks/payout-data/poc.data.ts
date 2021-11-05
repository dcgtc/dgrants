/**
 * @notice This data was generated with the following steps:
 *
 *   1. Head to getGrantRoundGrantData() in ./app/src/utils/data/grantRounds.ts and change the CLR constructor call
 *
 *      to include payouts:
 *          const clr = new CLR({
 *            calcAlgo: linear,
 *            includePayouts: true,
 *          } as InitArgs);
 *
 *   2. Place this inside that same method, after the _lsGrantPredictions definition:
 *
 *          // scores are to be presented in an array
 *          const trustBonusScores = Object.keys(trustBonus).map((address) => {
 *            return {
 *              address: address,
 *              score: trustBonus[address],
 *            };
 *          });
 *
 *          console.log(JSON.stringify(await clr.calculate({
 *            grantRound: roundAddress,
 *            totalPot: totalPot,
 *            matchingTokenDecimals: matchingTokenDecimals,
 *            contributions: _lsGrantDonations,
 *          }, {trustBonusScores:trustBonusScores}), 4));
 *
 *          console.log(await clr.verify({
 *            grantRound: roundAddress,
 *            totalPot: totalPot,
 *            matchingTokenDecimals: matchingTokenDecimals,
 *            contributions: _lsGrantDonations,
 *          }, '', "0x443b2765cf0b2fdc2054ac818f2b44ed0f125684798d1ba3aea4d8d39668ee40"));
 *
 *   3. Edit the return statement of `getContributions` in `contributions.ts` to only include
 *      contributions from block 20836866 or earlier, since this is the closes block to the
 *      round's end time. This block has a timestamp of 1635724798, and the round's endTime
 *      is 1635724799
 *
 *          return {
 *            ...contributions,
 *            contributions: contributions.contributions.filter(x => Number(x.blockNumber) <= 20836866)
 *          }
 *
 *   4. Open the app, connect your wallet and ensure it's connected to Polygon. Now, the
 *      data will be logged to the console, and this data was used to populate the below data
 */

// Address of the round the below data is for
export const round = '0x6c7B74D7640f401271208186e5CbBc6e7E2C73F4';

// Matching data, generated with the steps in the above comment
export const data = {
  distribution: [
    { grantId: 4, address: '0x00555dC77a343E205CB1C7755407c93470DB3F91', match: 946.1758278938145 },
    { grantId: 8, address: '0x0D89421D6eec0A4385F95f410732186A2Ab45077', match: 69.45693171942503 },
    { grantId: 10, address: '0x76577d204A5bd63b6D006222429c4D5124f4619c', match: 341.7461714220219 },
    { grantId: 11, address: '0x2A5B1B6188669da07947403Da21F1CAB501374e6', match: 386.9762818672259 },
    { grantId: 12, address: '0x6B5918D8EF9094679F4b4e1Bf397a66eA411B118', match: 494.5305640234786 },
    { grantId: 13, address: '0xb010ca9Be09C382A9f31b79493bb232bCC319f01', match: 316.1700969251294 },
    { grantId: 14, address: '0xBADCdDEA250f1e317Ba59999232464933C4E8D90', match: 190.9808712116415 },
    { grantId: 15, address: '0xD7db3B3300E9d15E680807381d8B21E2B0773402', match: 40.28715217984053 },
    { grantId: 16, address: '0xb9376ae861cB2D5D217F8670ec99B22d3794a333', match: 274.3557654314374 },
    { grantId: 17, address: '0x0aE16533212C0983e336f51688440492980d6C62', match: 290.95407376952846 },
    { grantId: 18, address: '0xC9a238405ef9D753D55EC1EB8F7A7b17B8d83E63', match: 579.1462124504936 },
  ],
  hasSaturated: false,
  grantRound: '0x6c7B74D7640f401271208186e5CbBc6e7E2C73F4',
  payoutDistribution: [
    { grantIds: [4], address: '0x00555dC77a343E205CB1C7755407c93470DB3F91', match: 946.1758278938145 },
    { grantIds: [8], address: '0x0D89421D6eec0A4385F95f410732186A2Ab45077', match: 69.45693171942503 },
    { grantIds: [10], address: '0x76577d204A5bd63b6D006222429c4D5124f4619c', match: 341.7461714220219 },
    { grantIds: [11], address: '0x2A5B1B6188669da07947403Da21F1CAB501374e6', match: 386.9762818672259 },
    { grantIds: [12], address: '0x6B5918D8EF9094679F4b4e1Bf397a66eA411B118', match: 494.5305640234786 },
    { grantIds: [13], address: '0xb010ca9Be09C382A9f31b79493bb232bCC319f01', match: 316.1700969251294 },
    { grantIds: [14], address: '0xBADCdDEA250f1e317Ba59999232464933C4E8D90', match: 190.9808712116415 },
    { grantIds: [15], address: '0xD7db3B3300E9d15E680807381d8B21E2B0773402', match: 40.28715217984053 },
    { grantIds: [16], address: '0xb9376ae861cB2D5D217F8670ec99B22d3794a333', match: 274.3557654314374 },
    { grantIds: [17], address: '0x0aE16533212C0983e336f51688440492980d6C62', match: 290.95407376952846 },
    { grantIds: [18], address: '0xC9a238405ef9D753D55EC1EB8F7A7b17B8d83E63', match: 579.1462124504936 },
  ],
  merkle: {
    merkleRoot: '0x443b2765cf0b2fdc2054ac818f2b44ed0f125684798d1ba3aea4d8d39668ee40',
    tokenTotal: '0xd51687b15ab92e0020',
    claims: {
      '0x00555dC77a343E205CB1C7755407c93470DB3F91': {
        index: 0,
        amount: '0x334ad3ce6a3ff31aa0',
        proof: [
          '0x08bf23bd54efab8b2e2f2ae44590a6fbcce1228b7657103ec28973827277a914',
          '0xc58594f6e1018a79f0b13227447b0c64bb80f9b7c98a3ef812be9df2bd651cc7',
          '0xae1311d31feb9c30e8590e2412741d1550910bc2d9210bf32113da5472e65db5',
          '0x76babe4cda1ae9f65a7fb5dced37faee5634f968a80b546242305db404730f5d',
        ],
      },
      '0x0D89421D6eec0A4385F95f410732186A2Ab45077': {
        index: 1,
        amount: '0x03c3e8976674e3f770',
        proof: [
          '0xeb565b20902aad1cabd6336f3bb4cec0cb519369c06f1fbc6c95ecd50481c4fe',
          '0xefcf4d8ade971e8650a20eaf394512af6b754fcc14e83e1de8181b974da9ff69',
          '0x261ba2ce9c0b4ae11ce013a3fc480c6ed1e76353ba5edbfd2b506e47796b2b4d',
        ],
      },
      '0x0aE16533212C0983e336f51688440492980d6C62': {
        index: 2,
        amount: '0x0fc5cc848d798b02e0',
        proof: [
          '0x9cf15be2683f012a15d7c45140e3839d4371e3738f5426876a3d00c1c33280b9',
          '0x70774408781e2841702dd793be4e258ac9aaa03c47eaca620c2f74224ec2e72a',
          '0xae1311d31feb9c30e8590e2412741d1550910bc2d9210bf32113da5472e65db5',
          '0x76babe4cda1ae9f65a7fb5dced37faee5634f968a80b546242305db404730f5d',
        ],
      },
      '0x2A5B1B6188669da07947403Da21F1CAB501374e6': {
        index: 3,
        amount: '0x14fa5fee11ed6fa3e0',
        proof: [
          '0xc8fceb9d1876abef8a1c715448f3cf0261351a5bc98cf1e2b26964501667c9ab',
          '0x3bbe98b096e83a7e743abb333959c2d8491c2c100aeeec294972fae968723a37',
          '0x4d5ffc3d5d8d6290b0c305068e918e6d99fb5c0f778e2f7543eb6201153b66e4',
          '0x76babe4cda1ae9f65a7fb5dced37faee5634f968a80b546242305db404730f5d',
        ],
      },
      '0x6B5918D8EF9094679F4b4e1Bf397a66eA411B118': {
        index: 4,
        amount: '0x1acefd7fd819034140',
        proof: [
          '0xa44ba86c38e2fcd013959b3e7d7f4e3972cefa837a9afea7b9d2b9a7fa7864f2',
          '0x70774408781e2841702dd793be4e258ac9aaa03c47eaca620c2f74224ec2e72a',
          '0xae1311d31feb9c30e8590e2412741d1550910bc2d9210bf32113da5472e65db5',
          '0x76babe4cda1ae9f65a7fb5dced37faee5634f968a80b546242305db404730f5d',
        ],
      },
      '0x76577d204A5bd63b6D006222429c4D5124f4619c': {
        index: 5,
        amount: '0x1286ae4c426f5dd6e0',
        proof: [
          '0xb05a0671ae08967b400350a3494fb7abb2f4592dffe8c62fae4136a58ecd23ce',
          '0x3f4bdfb1fb9e4fa964bb67b64e55993c8eced676959509c89e309d596d230d4d',
          '0x4d5ffc3d5d8d6290b0c305068e918e6d99fb5c0f778e2f7543eb6201153b66e4',
          '0x76babe4cda1ae9f65a7fb5dced37faee5634f968a80b546242305db404730f5d',
        ],
      },
      '0xBADCdDEA250f1e317Ba59999232464933C4E8D90': {
        index: 6,
        amount: '0x0a5a645a81c8847160',
        proof: [
          '0xbe7d24fb13342f2e8e617db9293e99150a638edf31358439f8f504a64bbce125',
          '0x3bbe98b096e83a7e743abb333959c2d8491c2c100aeeec294972fae968723a37',
          '0x4d5ffc3d5d8d6290b0c305068e918e6d99fb5c0f778e2f7543eb6201153b66e4',
          '0x76babe4cda1ae9f65a7fb5dced37faee5634f968a80b546242305db404730f5d',
        ],
      },
      '0xC9a238405ef9D753D55EC1EB8F7A7b17B8d83E63': {
        index: 7,
        amount: '0x1f6544abc68c951100',
        proof: [
          '0xd84fc6ded960418a00891b85390dd37d0b3ec928d3112f4fa27e8ac71cca0463',
          '0xefcf4d8ade971e8650a20eaf394512af6b754fcc14e83e1de8181b974da9ff69',
          '0x261ba2ce9c0b4ae11ce013a3fc480c6ed1e76353ba5edbfd2b506e47796b2b4d',
        ],
      },
      '0xD7db3B3300E9d15E680807381d8B21E2B0773402': {
        index: 8,
        amount: '0x022f18b775037fb650',
        proof: [
          '0xa07c40cf10dadd66fe18679f121f3de95e180296c2e4eca2c51e9c37c5f117ca',
          '0x261ba2ce9c0b4ae11ce013a3fc480c6ed1e76353ba5edbfd2b506e47796b2b4d',
        ],
      },
      '0xb010ca9Be09C382A9f31b79493bb232bCC319f01': {
        index: 9,
        amount: '0x1123bdd4032f295ec0',
        proof: [
          '0x09780f8a6fdc662ebae749b0f2357afbda582b6769b6708fc09bcd0ea298774f',
          '0xc58594f6e1018a79f0b13227447b0c64bb80f9b7c98a3ef812be9df2bd651cc7',
          '0xae1311d31feb9c30e8590e2412741d1550910bc2d9210bf32113da5472e65db5',
          '0x76babe4cda1ae9f65a7fb5dced37faee5634f968a80b546242305db404730f5d',
        ],
      },
      '0xb9376ae861cB2D5D217F8670ec99B22d3794a333': {
        index: 10,
        amount: '0x0edf737b0f8d3897c0',
        proof: [
          '0xa5390748da892195518900b8116c80887552bc4d9b6d8f990686b47767805a69',
          '0x3f4bdfb1fb9e4fa964bb67b64e55993c8eced676959509c89e309d596d230d4d',
          '0x4d5ffc3d5d8d6290b0c305068e918e6d99fb5c0f778e2f7543eb6201153b66e4',
          '0x76babe4cda1ae9f65a7fb5dced37faee5634f968a80b546242305db404730f5d',
        ],
      },
    },
  },
  hash: '0x443b2765cf0b2fdc2054ac818f2b44ed0f125684798d1ba3aea4d8d39668ee40',
};
