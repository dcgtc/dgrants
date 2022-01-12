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
 *      contributions from the block that matches the start time of the current Grant Round
 *      or earlier. You currently need to use the timestamp to find the block that matches using
 * 			a block explorer (like https://polygonscan.com) and changing the page number to guess at
 *      the closest block until you've found it. We will build a utility shortly to help make this
 *      easier.
 *
 *          return {
 *            ...contributions,
 *            contributions: contributions.contributions.filter(x => Number(x.blockNumber) <= 20836866)
 *          }
 *
 *   4. Open the app, connect your wallet and ensure it's connected to Polygon.
 *      Look for the output in the console log and locate the merkleRoot field using the hash
 *      found there to replace the has in the console log above. Now you can restart the app and
 *      refresh (you may have to delete the local IndexDB and then hard refresh in order to get the
 *      console log to show up again) and should see that the distribution is verified. You then
 *      use the data in that console log to populate the script below.
 */

// Address of the round the below data is for
export const round = '0xa94E824ac0907c1Db5145F7fDb326A8bBfCa5599';

// Matching data, generated with the steps in the above comment
export const data = {
  distribution: [
    {
      grantId: 0,
      address: '0xf503017D7baF7FBC0fff7492b751025c6A78179b',
      match: 3972.042135115482,
    },
    {
      grantId: 1,
      address: '0xfb0A07F4B89A46997e036d8D5202Bba3ab9831d5',
      match: 2331.357004262948,
    },
    {
      grantId: 2,
      address: '0xBADCdDEA250f1e317Ba59999232464933C4E8D90',
      match: 1882.3665289005455,
    },
    {
      grantId: 3,
      address: '0x521aacB43d89E1b8FFD64d9eF76B0a1074dEdaF8',
      match: 2174.267743437177,
    },
    {
      grantId: 4,
      address: '0x0D89421D6eec0A4385F95f410732186A2Ab45077',
      match: 1396.3708331935454,
    },
    {
      grantId: 5,
      address: '0x756239E5B7D2aa6F3DA0594B296952121Fb71606',
      match: 4758.537550995785,
    },
    {
      grantId: 7,
      address: '0x397b2dA916Fd53d1db9758c65972c60a2c037d78',
      match: 3130.8923442098853,
    },
    {
      grantId: 20,
      address: '0x26Cc4f46aEC6486E7341cE91996fEeE7839a1C6C',
      match: 394.7266363429251,
    },
    {
      grantId: 26,
      address: '0x5f6F655cefe99572293dCaf831fF391c38dF3b8B',
      match: 496.41530664247074,
    },
    {
      grantId: 28,
      address: '0x7e30FB962f951ef78D901865F87DD036fc5aa946',
      match: 219.7557357376667,
    },
    {
      grantId: 30,
      address: '0x3e7A4D888FC338BC4c7C7e81E2322486b65d5Cd0',
      match: 312.13078893574544,
    },
    {
      grantId: 31,
      address: '0x521aacB43d89E1b8FFD64d9eF76B0a1074dEdaF8',
      match: 236.59917288057605,
    },
    {
      grantId: 34,
      address: '0x2e2316088c015F4BF27D86A1458A707af536A324',
      match: 395.06500831590546,
    },
    {
      grantId: 39,
      address: '0x59AE7f21D18b2F5fDC7a99c4fd6dD9E67Cec0Bc9',
      match: 298.5933699051858,
    },
    {
      grantId: 41,
      address: '0x41D2a18E1DdACdAbFDdADB62e9AEE67c63070b76',
      match: 304.5845379188032,
    },
    {
      grantId: 47,
      address: '0x5D603faE5ce6119a7a4296DeF1173535126ee999',
      match: 529.140927125897,
    },
    {
      grantId: 55,
      address: '0xA4704B83dd29c36eEB6e0bCA545F45eCd84AaF9C',
      match: 112.19916467397937,
    },
    {
      grantId: 60,
      address: '0x1c70E21a02F0B244453Fc4702C43917f657B47d2',
      match: 146.6069705623518,
    },
    {
      grantId: 62,
      address: '0xfa0902DBbf44C778c959f919BC4915ef23787140',
      match: 519.6706420989595,
    },
    {
      grantId: 63,
      address: '0x51DE0FE79284b53f2473Dda5177e779813Af5649',
      match: 800.0120476876725,
    },
    {
      grantId: 64,
      address: '0x644b37EA8027B81ef1bDCd10Ac0A78eA8532b7C8',
      match: 145.14679394813507,
    },
    {
      grantId: 65,
      address: '0x15ef9189a8282E4e1e985EB8eD767e7426B4bfD5',
      match: 218.41601315602813,
    },
    {
      grantId: 67,
      address: '0x54727a65CC4f71418A29A6f18E5be808Efe89856',
      match: 179.84395908783878,
    },
    {
      grantId: 69,
      address: '0x1D8D74c3C5597618d8a00662Dc30021cD8D35Dfb',
      match: 789.9671587049173,
    },
  ],
  hasSaturated: true,
  grantRound: '0xa94E824ac0907c1Db5145F7fDb326A8bBfCa5599',
  payoutDistribution: [
    {
      grantIds: [0],
      address: '0xf503017D7baF7FBC0fff7492b751025c6A78179b',
      match: 3972.042135115482,
    },
    {
      grantIds: [1],
      address: '0xfb0A07F4B89A46997e036d8D5202Bba3ab9831d5',
      match: 2331.357004262948,
    },
    {
      grantIds: [2],
      address: '0xBADCdDEA250f1e317Ba59999232464933C4E8D90',
      match: 1882.3665289005455,
    },
    {
      grantIds: [31, 3],
      address: '0x521aacB43d89E1b8FFD64d9eF76B0a1074dEdaF8',
      match: 2410.8669163177533,
    },
    {
      grantIds: [4],
      address: '0x0D89421D6eec0A4385F95f410732186A2Ab45077',
      match: 1396.3708331935454,
    },
    {
      grantIds: [5],
      address: '0x756239E5B7D2aa6F3DA0594B296952121Fb71606',
      match: 4758.537550995785,
    },
    {
      grantIds: [7],
      address: '0x397b2dA916Fd53d1db9758c65972c60a2c037d78',
      match: 3130.8923442098853,
    },
    {
      grantIds: [20],
      address: '0x26Cc4f46aEC6486E7341cE91996fEeE7839a1C6C',
      match: 394.7266363429251,
    },
    {
      grantIds: [26],
      address: '0x5f6F655cefe99572293dCaf831fF391c38dF3b8B',
      match: 496.41530664247074,
    },
    {
      grantIds: [28],
      address: '0x7e30FB962f951ef78D901865F87DD036fc5aa946',
      match: 219.7557357376667,
    },
    {
      grantIds: [30],
      address: '0x3e7A4D888FC338BC4c7C7e81E2322486b65d5Cd0',
      match: 312.13078893574544,
    },
    {
      grantIds: [34],
      address: '0x2e2316088c015F4BF27D86A1458A707af536A324',
      match: 395.06500831590546,
    },
    {
      grantIds: [39],
      address: '0x59AE7f21D18b2F5fDC7a99c4fd6dD9E67Cec0Bc9',
      match: 298.5933699051858,
    },
    {
      grantIds: [41],
      address: '0x41D2a18E1DdACdAbFDdADB62e9AEE67c63070b76',
      match: 304.5845379188032,
    },
    {
      grantIds: [47],
      address: '0x5D603faE5ce6119a7a4296DeF1173535126ee999',
      match: 529.140927125897,
    },
    {
      grantIds: [55],
      address: '0xA4704B83dd29c36eEB6e0bCA545F45eCd84AaF9C',
      match: 112.19916467397937,
    },
    {
      grantIds: [60],
      address: '0x1c70E21a02F0B244453Fc4702C43917f657B47d2',
      match: 146.6069705623518,
    },
    {
      grantIds: [62],
      address: '0xfa0902DBbf44C778c959f919BC4915ef23787140',
      match: 519.6706420989595,
    },
    {
      grantIds: [63],
      address: '0x51DE0FE79284b53f2473Dda5177e779813Af5649',
      match: 800.0120476876725,
    },
    {
      grantIds: [64],
      address: '0x644b37EA8027B81ef1bDCd10Ac0A78eA8532b7C8',
      match: 145.14679394813507,
    },
    {
      grantIds: [65],
      address: '0x15ef9189a8282E4e1e985EB8eD767e7426B4bfD5',
      match: 218.41601315602813,
    },
    {
      grantIds: [67],
      address: '0x54727a65CC4f71418A29A6f18E5be808Efe89856',
      match: 179.84395908783878,
    },
    {
      grantIds: [69],
      address: '0x1D8D74c3C5597618d8a00662Dc30021cD8D35Dfb',
      match: 789.9671587049173,
    },
  ],
  merkle: {
    merkleRoot: '0x4628602df03c0405bf04b88dd4e7702070d1f88a364432c0e8353d816b02a2f7',
    tokenTotal: '0x05739f9998b26f0b51f0',
    claims: {
      '0x0D89421D6eec0A4385F95f410732186A2Ab45077': {
        index: 0,
        amount: '0x4bb289c27ff1827ec0',
        proof: [
          '0xde67549379f81ad5c972bd5a843e9cc4cc40752a052c5b8d4c1ee5127fa1121e',
          '0xcd8a9e6bfb3337ba08ad5344cb20a1bb7f7cb274d0d24f534c9e749aed752747',
          '0x473d6085207431944e300d562e3cd52dbc137e20d7cab8a82d17847bdc5a2dcf',
          '0x978898cb749d2c91368deffaa680b39e092b9c886cefe619920dd22df9ed88c1',
        ],
      },
      '0x15ef9189a8282E4e1e985EB8eD767e7426B4bfD5': {
        index: 1,
        amount: '0x0bd7218ebf6e1a22d0',
        proof: [
          '0xa90ac11c206ac38d9edaa1628264b0fc36f3abfe33e00621bb25219619aa4b4e',
          '0xa6da741b77df7512ce674a46e2ce98c74fd2f23170aef98d8ee411b76df82e12',
          '0x44ec167de2ea392a5926c446e979ef987bceb546115a3cf7e0ecab0eef3ab509',
          '0x2167e4c8d668fb75d948d6ad6ecc6ebe46347aa23cc6fc7c1454aafd1df0d488',
          '0x81bcdda58dcd4a7d5ad32ef8bc9fabb2b99dff07c726af5eba757e96e99c2458',
        ],
      },
      '0x1D8D74c3C5597618d8a00662Dc30021cD8D35Dfb': {
        index: 2,
        amount: '0x2ad2ff216aaf39c320',
        proof: [
          '0xdf14cc161d10d28ee6e43769ca72e6c23dbb28f2f197eb4a078b5605add7c4b8',
          '0xcd8a9e6bfb3337ba08ad5344cb20a1bb7f7cb274d0d24f534c9e749aed752747',
          '0x473d6085207431944e300d562e3cd52dbc137e20d7cab8a82d17847bdc5a2dcf',
          '0x978898cb749d2c91368deffaa680b39e092b9c886cefe619920dd22df9ed88c1',
        ],
      },
      '0x1c70E21a02F0B244453Fc4702C43917f657B47d2': {
        index: 3,
        amount: '0x07f29496f82d211ec0',
        proof: [
          '0x1351e633f78a9c7bf5428e01e9c47b669a7390842d115b19a25ba509931dc85c',
          '0x63444b95a4d2bb37471567ec944f6ad2b7957374173b6cff74ed9feaba5146b6',
          '0x978898cb749d2c91368deffaa680b39e092b9c886cefe619920dd22df9ed88c1',
        ],
      },
      '0x26Cc4f46aEC6486E7341cE91996fEeE7839a1C6C': {
        index: 4,
        amount: '0x1565eeb8670cd883e0',
        proof: [
          '0x6f507009641365a31ab01dfa3e5e3ad267952c8b46991c6eef52a4d5be74f22e',
          '0x635ebd95e63435cd4054dab681cadc3c8945b47f1946b976c652b6311739ef12',
          '0xfccd5e8964bcbb21182d151eba88662fc32301df4109056aef7f6f08c3214658',
          '0x2167e4c8d668fb75d948d6ad6ecc6ebe46347aa23cc6fc7c1454aafd1df0d488',
          '0x81bcdda58dcd4a7d5ad32ef8bc9fabb2b99dff07c726af5eba757e96e99c2458',
        ],
      },
      '0x2e2316088c015F4BF27D86A1458A707af536A324': {
        index: 5,
        amount: '0x156aa0dbeb5049c720',
        proof: [
          '0xe073ea6138187020a022a4209323cfdc58f4f4f4b025b9b77124c6fe117ca346',
          '0x3ae5a2ebfebb4b9ffc825e140b06f2c691db80a629714d5e034778574123dc51',
          '0x473d6085207431944e300d562e3cd52dbc137e20d7cab8a82d17847bdc5a2dcf',
          '0x978898cb749d2c91368deffaa680b39e092b9c886cefe619920dd22df9ed88c1',
        ],
      },
      '0x397b2dA916Fd53d1db9758c65972c60a2c037d78': {
        index: 6,
        amount: '0xa9b9dc0ee15c3f0520',
        proof: [
          '0x5ed554a8870020035060f48beb517385d9f344cb239f4607ef4df17dd8e564bc',
          '0x29c63c64fa0fb7ee1fe675e208c242b93bd2a8c26d54b585ff79b7504abe4973',
          '0x238e856a3c89b036488476d29cbcc45db0cc51cd546f6477df6025b77ce4de94',
          '0x44192842dc45ef4bbc691084bd78ae57121b7691fae2e45fd32ffa09c9bb3190',
          '0x81bcdda58dcd4a7d5ad32ef8bc9fabb2b99dff07c726af5eba757e96e99c2458',
        ],
      },
      '0x3e7A4D888FC338BC4c7C7e81E2322486b65d5Cd0': {
        index: 7,
        amount: '0x10ebaf52cc19888900',
        proof: [
          '0xecc6b72f45c410a1de73e04d8c4bc2a41816fd4abaefefa38b7d23ba139b192b',
          '0x3ae5a2ebfebb4b9ffc825e140b06f2c691db80a629714d5e034778574123dc51',
          '0x473d6085207431944e300d562e3cd52dbc137e20d7cab8a82d17847bdc5a2dcf',
          '0x978898cb749d2c91368deffaa680b39e092b9c886cefe619920dd22df9ed88c1',
        ],
      },
      '0x41D2a18E1DdACdAbFDdADB62e9AEE67c63070b76': {
        index: 8,
        amount: '0x1082f5a77aa6c2c800',
        proof: [
          '0x0001bf5ccf40dacc8b5266ae342aa339561c9fc2e53500714b6f48bc207f53f6',
          '0x956e8a7834682400a0f4ab4bece23568e9a25b1c8bec255f1e09c714a22b0e58',
          '0x139c76a815ae3411c76b4045ef5517b06119f5083bf2292aa707d086dffd7080',
          '0x44192842dc45ef4bbc691084bd78ae57121b7691fae2e45fd32ffa09c9bb3190',
          '0x81bcdda58dcd4a7d5ad32ef8bc9fabb2b99dff07c726af5eba757e96e99c2458',
        ],
      },
      '0x51DE0FE79284b53f2473Dda5177e779813Af5649': {
        index: 9,
        amount: '0x2b5e65beb9f8958f20',
        proof: [
          '0xfead29cda711d3d0547d1cf906c105abf935b2f072fae4539160b049a19228f6',
          '0xff7037d6bdef535873392b0c0ec910e54208ae7c2ab192d7fb4b5720a4e863bd',
          '0x63444b95a4d2bb37471567ec944f6ad2b7957374173b6cff74ed9feaba5146b6',
          '0x978898cb749d2c91368deffaa680b39e092b9c886cefe619920dd22df9ed88c1',
        ],
      },
      '0x521aacB43d89E1b8FFD64d9eF76B0a1074dEdaF8': {
        index: 10,
        amount: '0x82b17fdf121514d420',
        proof: [
          '0x69838673d231635ee2e1d940406112899cfdbd0ea4d4ae692acac8cecc3c5063',
          '0x29c63c64fa0fb7ee1fe675e208c242b93bd2a8c26d54b585ff79b7504abe4973',
          '0x238e856a3c89b036488476d29cbcc45db0cc51cd546f6477df6025b77ce4de94',
          '0x44192842dc45ef4bbc691084bd78ae57121b7691fae2e45fd32ffa09c9bb3190',
          '0x81bcdda58dcd4a7d5ad32ef8bc9fabb2b99dff07c726af5eba757e96e99c2458',
        ],
      },
      '0x54727a65CC4f71418A29A6f18E5be808Efe89856': {
        index: 11,
        amount: '0x09bfd617efae83da60',
        proof: [
          '0x895e1d4b584765152e4b9199da1eb5ec4e1992673cb52a8cea8fda2361ec1d65',
          '0x0892d5db9a5335c9cccbbd81d93223761dd4bb721b298e85d893e44b4f8f45ab',
          '0xfccd5e8964bcbb21182d151eba88662fc32301df4109056aef7f6f08c3214658',
          '0x2167e4c8d668fb75d948d6ad6ecc6ebe46347aa23cc6fc7c1454aafd1df0d488',
          '0x81bcdda58dcd4a7d5ad32ef8bc9fabb2b99dff07c726af5eba757e96e99c2458',
        ],
      },
      '0x59AE7f21D18b2F5fDC7a99c4fd6dD9E67Cec0Bc9': {
        index: 12,
        amount: '0x102fd0bfe9cd69bf40',
        proof: [
          '0x82eb69bd75b231457f478cb1ab9965b900afa0275e68d4353d0d121c9d1a3108',
          '0x635ebd95e63435cd4054dab681cadc3c8945b47f1946b976c652b6311739ef12',
          '0xfccd5e8964bcbb21182d151eba88662fc32301df4109056aef7f6f08c3214658',
          '0x2167e4c8d668fb75d948d6ad6ecc6ebe46347aa23cc6fc7c1454aafd1df0d488',
          '0x81bcdda58dcd4a7d5ad32ef8bc9fabb2b99dff07c726af5eba757e96e99c2458',
        ],
      },
      '0x5D603faE5ce6119a7a4296DeF1173535126ee999': {
        index: 13,
        amount: '0x1caf4e35b653f2b440',
        proof: [
          '0x4a6bd949ffc66eb0258dee24184a48c79919810f78138235f055dc2990d83a9c',
          '0x441051a4fbf5687cbffdd00e9e2fd4dbeeaea42a55cf8285d4a669945b622593',
          '0x238e856a3c89b036488476d29cbcc45db0cc51cd546f6477df6025b77ce4de94',
          '0x44192842dc45ef4bbc691084bd78ae57121b7691fae2e45fd32ffa09c9bb3190',
          '0x81bcdda58dcd4a7d5ad32ef8bc9fabb2b99dff07c726af5eba757e96e99c2458',
        ],
      },
      '0x5f6F655cefe99572293dCaf831fF391c38dF3b8B': {
        index: 14,
        amount: '0x1ae925734533142020',
        proof: [
          '0xf76fbf33b8badc89e4d7fa1f265f8843027d9cd39bef3665b3b7082658028cab',
          '0xff7037d6bdef535873392b0c0ec910e54208ae7c2ab192d7fb4b5720a4e863bd',
          '0x63444b95a4d2bb37471567ec944f6ad2b7957374173b6cff74ed9feaba5146b6',
          '0x978898cb749d2c91368deffaa680b39e092b9c886cefe619920dd22df9ed88c1',
        ],
      },
      '0x644b37EA8027B81ef1bDCd10Ac0A78eA8532b7C8': {
        index: 15,
        amount: '0x07de5100133d689930',
        proof: [
          '0xd3491b286cd4764b2bb827c3751b2d5780b669973fa22b57af2faf6711913860',
          '0x50faa6f837463b5eaea0be4590a58da5c552f864de979746f481128cec58a193',
          '0x44ec167de2ea392a5926c446e979ef987bceb546115a3cf7e0ecab0eef3ab509',
          '0x2167e4c8d668fb75d948d6ad6ecc6ebe46347aa23cc6fc7c1454aafd1df0d488',
          '0x81bcdda58dcd4a7d5ad32ef8bc9fabb2b99dff07c726af5eba757e96e99c2458',
        ],
      },
      '0x756239E5B7D2aa6F3DA0594B296952121Fb71606': {
        index: 16,
        amount: '0x0101f5f972d175042440',
        proof: [
          '0xcff84846ea2763b13eec3c308a2c5178b75c61d2fa14f2e90024e5003d11e4f3',
          '0x50faa6f837463b5eaea0be4590a58da5c552f864de979746f481128cec58a193',
          '0x44ec167de2ea392a5926c446e979ef987bceb546115a3cf7e0ecab0eef3ab509',
          '0x2167e4c8d668fb75d948d6ad6ecc6ebe46347aa23cc6fc7c1454aafd1df0d488',
          '0x81bcdda58dcd4a7d5ad32ef8bc9fabb2b99dff07c726af5eba757e96e99c2458',
        ],
      },
      '0x7e30FB962f951ef78D901865F87DD036fc5aa946': {
        index: 17,
        amount: '0x0be9b935566e3d02e0',
        proof: [
          '0x9eddacae319910a883f4f42c250d2dfec30b94627c01db99e43dbe89080526ae',
          '0x0892d5db9a5335c9cccbbd81d93223761dd4bb721b298e85d893e44b4f8f45ab',
          '0xfccd5e8964bcbb21182d151eba88662fc32301df4109056aef7f6f08c3214658',
          '0x2167e4c8d668fb75d948d6ad6ecc6ebe46347aa23cc6fc7c1454aafd1df0d488',
          '0x81bcdda58dcd4a7d5ad32ef8bc9fabb2b99dff07c726af5eba757e96e99c2458',
        ],
      },
      '0xA4704B83dd29c36eEB6e0bCA545F45eCd84AaF9C': {
        index: 18,
        amount: '0x06151381d07818ca10',
        proof: [
          '0x44f7d9fec7e43bfdedc22dece4715d3d7fe8cfb81effe703166f487d10eeaa2a',
          '0x81effb4b3cf187b3d2438a2929b09b194027af0e79901f744a749ec4844eca3e',
          '0x139c76a815ae3411c76b4045ef5517b06119f5083bf2292aa707d086dffd7080',
          '0x44192842dc45ef4bbc691084bd78ae57121b7691fae2e45fd32ffa09c9bb3190',
          '0x81bcdda58dcd4a7d5ad32ef8bc9fabb2b99dff07c726af5eba757e96e99c2458',
        ],
      },
      '0xBADCdDEA250f1e317Ba59999232464933C4E8D90': {
        index: 19,
        amount: '0x660b1550d46a15d360',
        proof: [
          '0xc9a1ba78d716b6cc9db81edaca4f5324b90632c2e959a1dfc2d40d28a9c3e3cf',
          '0xa6da741b77df7512ce674a46e2ce98c74fd2f23170aef98d8ee411b76df82e12',
          '0x44ec167de2ea392a5926c446e979ef987bceb546115a3cf7e0ecab0eef3ab509',
          '0x2167e4c8d668fb75d948d6ad6ecc6ebe46347aa23cc6fc7c1454aafd1df0d488',
          '0x81bcdda58dcd4a7d5ad32ef8bc9fabb2b99dff07c726af5eba757e96e99c2458',
        ],
      },
      '0xf503017D7baF7FBC0fff7492b751025c6A78179b': {
        index: 20,
        amount: '0xd753286d1b3a6fea80',
        proof: [
          '0x5a8726e931c1f9deb4ac53625422b007152743b6435f971bd130462a20b82430',
          '0x441051a4fbf5687cbffdd00e9e2fd4dbeeaea42a55cf8285d4a669945b622593',
          '0x238e856a3c89b036488476d29cbcc45db0cc51cd546f6477df6025b77ce4de94',
          '0x44192842dc45ef4bbc691084bd78ae57121b7691fae2e45fd32ffa09c9bb3190',
          '0x81bcdda58dcd4a7d5ad32ef8bc9fabb2b99dff07c726af5eba757e96e99c2458',
        ],
      },
      '0xfa0902DBbf44C778c959f919BC4915ef23787140': {
        index: 21,
        amount: '0x1c2be0ffa7eba342e0',
        proof: [
          '0x1e4a174c3e42c67c9119d21e762213638b535b17123e679a1ca02af8eb8658a0',
          '0x956e8a7834682400a0f4ab4bece23568e9a25b1c8bec255f1e09c714a22b0e58',
          '0x139c76a815ae3411c76b4045ef5517b06119f5083bf2292aa707d086dffd7080',
          '0x44192842dc45ef4bbc691084bd78ae57121b7691fae2e45fd32ffa09c9bb3190',
          '0x81bcdda58dcd4a7d5ad32ef8bc9fabb2b99dff07c726af5eba757e96e99c2458',
        ],
      },
      '0xfb0A07F4B89A46997e036d8D5202Bba3ab9831d5': {
        index: 22,
        amount: '0x7e6213eb517fdcd100',
        proof: [
          '0x3d2bb7ff11044a22f21361d568f9dd3332f291811fd9cc30bbbfcaff4a7dd8f7',
          '0x81effb4b3cf187b3d2438a2929b09b194027af0e79901f744a749ec4844eca3e',
          '0x139c76a815ae3411c76b4045ef5517b06119f5083bf2292aa707d086dffd7080',
          '0x44192842dc45ef4bbc691084bd78ae57121b7691fae2e45fd32ffa09c9bb3190',
          '0x81bcdda58dcd4a7d5ad32ef8bc9fabb2b99dff07c726af5eba757e96e99c2458',
        ],
      },
    },
  },
  hash: '0x4628602df03c0405bf04b88dd4e7702070d1f88a364432c0e8353d816b02a2f7',
};
