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
      match: 4399.393126858889,
    },
    {
      grantId: 1,
      address: '0xfb0A07F4B89A46997e036d8D5202Bba3ab9831d5',
      match: 2286.133951186133,
    },
    {
      grantId: 2,
      address: '0xBADCdDEA250f1e317Ba59999232464933C4E8D90',
      match: 1811.2037072381936,
    },
    {
      grantId: 3,
      address: '0x521aacB43d89E1b8FFD64d9eF76B0a1074dEdaF8',
      match: 1984.6189874043364,
    },
    {
      grantId: 4,
      address: '0x0D89421D6eec0A4385F95f410732186A2Ab45077',
      match: 1297.5364163359054,
    },
    {
      grantId: 5,
      address: '0x756239E5B7D2aa6F3DA0594B296952121Fb71606',
      match: 4170.5146621673275,
    },
    {
      grantId: 7,
      address: '0x397b2dA916Fd53d1db9758c65972c60a2c037d78',
      match: 3054.1390484080757,
    },
    {
      grantId: 20,
      address: '0x26Cc4f46aEC6486E7341cE91996fEeE7839a1C6C',
      match: 448.9009574902401,
    },
    {
      grantId: 26,
      address: '0x5f6F655cefe99572293dCaf831fF391c38dF3b8B',
      match: 555.5879881140407,
    },
    {
      grantId: 28,
      address: '0x7e30FB962f951ef78D901865F87DD036fc5aa946',
      match: 170.62793868095966,
    },
    {
      grantId: 30,
      address: '0x3e7A4D888FC338BC4c7C7e81E2322486b65d5Cd0',
      match: 314.8079427085378,
    },
    {
      grantId: 31,
      address: '0x521aacB43d89E1b8FFD64d9eF76B0a1074dEdaF8',
      match: 253.98409858631638,
    },
    {
      grantId: 34,
      address: '0x2e2316088c015F4BF27D86A1458A707af536A324',
      match: 436.69820990643996,
    },
    {
      grantId: 39,
      address: '0x59AE7f21D18b2F5fDC7a99c4fd6dD9E67Cec0Bc9',
      match: 259.45129329321577,
    },
    {
      grantId: 41,
      address: '0x41D2a18E1DdACdAbFDdADB62e9AEE67c63070b76',
      match: 331.0309095998093,
    },
    {
      grantId: 47,
      address: '0x5D603faE5ce6119a7a4296DeF1173535126ee999',
      match: 672.0750336628383,
    },
    {
      grantId: 55,
      address: '0xA4704B83dd29c36eEB6e0bCA545F45eCd84AaF9C',
      match: 100.648223523591,
    },
    {
      grantId: 60,
      address: '0x1c70E21a02F0B244453Fc4702C43917f657B47d2',
      match: 114.55086221537744,
    },
    {
      grantId: 62,
      address: '0xfa0902DBbf44C778c959f919BC4915ef23787140',
      match: 537.242903001383,
    },
    {
      grantId: 63,
      address: '0x51DE0FE79284b53f2473Dda5177e779813Af5649',
      match: 1025.5274704679978,
    },
    {
      grantId: 64,
      address: '0x644b37EA8027B81ef1bDCd10Ac0A78eA8532b7C8',
      match: 119.81419619353359,
    },
    {
      grantId: 65,
      address: '0x15ef9189a8282E4e1e985EB8eD767e7426B4bfD5',
      match: 186.82183086279582,
    },
    {
      grantId: 67,
      address: '0x54727a65CC4f71418A29A6f18E5be808Efe89856',
      match: 182.08266679868385,
    },
    {
      grantId: 69,
      address: '0x1D8D74c3C5597618d8a00662Dc30021cD8D35Dfb',
      match: 1031.3159491358024,
    },
  ],
  hasSaturated: true,
  grantRound: '0xa94E824ac0907c1Db5145F7fDb326A8bBfCa5599',
  payoutDistribution: [
    {
      grantIds: [0],
      address: '0xf503017D7baF7FBC0fff7492b751025c6A78179b',
      match: 4399.393126858889,
    },
    {
      grantIds: [1],
      address: '0xfb0A07F4B89A46997e036d8D5202Bba3ab9831d5',
      match: 2286.133951186133,
    },
    {
      grantIds: [2],
      address: '0xBADCdDEA250f1e317Ba59999232464933C4E8D90',
      match: 1811.2037072381936,
    },
    {
      grantIds: [31, 3],
      address: '0x521aacB43d89E1b8FFD64d9eF76B0a1074dEdaF8',
      match: 2238.6030859906527,
    },
    {
      grantIds: [4],
      address: '0x0D89421D6eec0A4385F95f410732186A2Ab45077',
      match: 1297.5364163359054,
    },
    {
      grantIds: [5],
      address: '0x756239E5B7D2aa6F3DA0594B296952121Fb71606',
      match: 4170.5146621673275,
    },
    {
      grantIds: [7],
      address: '0x397b2dA916Fd53d1db9758c65972c60a2c037d78',
      match: 3054.1390484080757,
    },
    {
      grantIds: [20],
      address: '0x26Cc4f46aEC6486E7341cE91996fEeE7839a1C6C',
      match: 448.9009574902401,
    },
    {
      grantIds: [26],
      address: '0x5f6F655cefe99572293dCaf831fF391c38dF3b8B',
      match: 555.5879881140407,
    },
    {
      grantIds: [28],
      address: '0x7e30FB962f951ef78D901865F87DD036fc5aa946',
      match: 170.62793868095966,
    },
    {
      grantIds: [30],
      address: '0x3e7A4D888FC338BC4c7C7e81E2322486b65d5Cd0',
      match: 314.8079427085378,
    },
    {
      grantIds: [34],
      address: '0x2e2316088c015F4BF27D86A1458A707af536A324',
      match: 436.69820990643996,
    },
    {
      grantIds: [39],
      address: '0x59AE7f21D18b2F5fDC7a99c4fd6dD9E67Cec0Bc9',
      match: 259.45129329321577,
    },
    {
      grantIds: [41],
      address: '0x41D2a18E1DdACdAbFDdADB62e9AEE67c63070b76',
      match: 331.0309095998093,
    },
    {
      grantIds: [47],
      address: '0x5D603faE5ce6119a7a4296DeF1173535126ee999',
      match: 672.0750336628383,
    },
    {
      grantIds: [55],
      address: '0xA4704B83dd29c36eEB6e0bCA545F45eCd84AaF9C',
      match: 100.648223523591,
    },
    {
      grantIds: [60],
      address: '0x1c70E21a02F0B244453Fc4702C43917f657B47d2',
      match: 114.55086221537744,
    },
    {
      grantIds: [62],
      address: '0xfa0902DBbf44C778c959f919BC4915ef23787140',
      match: 537.242903001383,
    },
    {
      grantIds: [63],
      address: '0x51DE0FE79284b53f2473Dda5177e779813Af5649',
      match: 1025.5274704679978,
    },
    {
      grantIds: [64],
      address: '0x644b37EA8027B81ef1bDCd10Ac0A78eA8532b7C8',
      match: 119.81419619353359,
    },
    {
      grantIds: [65],
      address: '0x15ef9189a8282E4e1e985EB8eD767e7426B4bfD5',
      match: 186.82183086279582,
    },
    {
      grantIds: [67],
      address: '0x54727a65CC4f71418A29A6f18E5be808Efe89856',
      match: 182.08266679868385,
    },
    {
      grantIds: [69],
      address: '0x1D8D74c3C5597618d8a00662Dc30021cD8D35Dfb',
      match: 1031.3159491358024,
    },
  ],
  merkle: {
    merkleRoot: '0xf4c9cc27aa6153b78311c90cec9807a9ca5b969952f9b1c50c70f69fedbb8f55',
    tokenTotal: '0x05739f9998b26edd8b30',
    claims: {
      '0x0D89421D6eec0A4385F95f410732186A2Ab45077': {
        index: 0,
        amount: '0x4656ef6003d2ffa4c0',
        proof: [
          '0x53bcba3df55205f0376c3cfb9c97721f859dc4d1f1c58b33cbd1a2ba0b47a616',
          '0x783f9233d937dc2869a00d5ddde0ec15fd30dfcddf0ae9d15d02367651d4cfc4',
          '0x6925ada8634149f97e4fd8dd058341b54e07469e96f2b6f607c375d389f9bf0b',
          '0x3cc76f37533c2228ffd2d75a2f985b18d97a9d1bbe8f027d637fe948b5902571',
          '0xd5fdf5b88c97c01880e384fe4163b3420b9e1fcabb7269b9658059340a97bad8',
        ],
      },
      '0x15ef9189a8282E4e1e985EB8eD767e7426B4bfD5': {
        index: 1,
        amount: '0x0a20ac7958610dcbe0',
        proof: [
          '0x50f5dec6224f30c58b0727d2c4cee7bb9f990fa00a9c4a922550022df9207cb8',
          '0x783f9233d937dc2869a00d5ddde0ec15fd30dfcddf0ae9d15d02367651d4cfc4',
          '0x6925ada8634149f97e4fd8dd058341b54e07469e96f2b6f607c375d389f9bf0b',
          '0x3cc76f37533c2228ffd2d75a2f985b18d97a9d1bbe8f027d637fe948b5902571',
          '0xd5fdf5b88c97c01880e384fe4163b3420b9e1fcabb7269b9658059340a97bad8',
        ],
      },
      '0x1D8D74c3C5597618d8a00662Dc30021cD8D35Dfb': {
        index: 2,
        amount: '0x37e8624797ca53fd00',
        proof: [
          '0x045809128bcd36b11be8da994de1fb87207499169848b7259472b44a4802bf83',
          '0x227396216d4c84ae59da255f8207412bd74c04e7b2a7a6bc6e1b8ab4f6064c2b',
          '0x2a202d5c641b2ffdd86e3e34d1b8811233a42bb9faf998ab7494907db1833cf3',
          '0x3cc76f37533c2228ffd2d75a2f985b18d97a9d1bbe8f027d637fe948b5902571',
          '0xd5fdf5b88c97c01880e384fe4163b3420b9e1fcabb7269b9658059340a97bad8',
        ],
      },
      '0x1c70E21a02F0B244453Fc4702C43917f657B47d2': {
        index: 3,
        amount: '0x0635b66a44b649cd00',
        proof: [
          '0xe33d374fc11850c9f687156bda69969794787130f7c57d2462688c41fa7c1fce',
          '0xf83afc726365020067aaa3474b58d7edbcefb7a3fcae2c44f9295a045e8edd0f',
          '0xfcdebe07a9479e6a7b330f4fa2e4d91832747a76ef26fb250dc49e11b154cfc3',
          '0x032eeb6d2735346d51e11cace59f6cbd1fe9f281f0024a44de74c36ec8bf423e',
        ],
      },
      '0x26Cc4f46aEC6486E7341cE91996fEeE7839a1C6C': {
        index: 4,
        amount: '0x1855c092754a7d16a0',
        proof: [
          '0xb00fb93a3b76a5592b0da5eb9fc34618fa8b6d054229a13da92e58d9f6fb4a80',
          '0xac21fe9367a5da5bf5cf56873a863594897f1fe7b7a4c0d87291e4da2737b74a',
          '0xc2c0e4a825324acf35a271a99c20e925c66e4e930dc4509376378922ebbae387',
          '0x33906112c743a3df753fff34d82df1ecf50874c76dcc94f02514362f0093a590',
          '0xd5fdf5b88c97c01880e384fe4163b3420b9e1fcabb7269b9658059340a97bad8',
        ],
      },
      '0x2e2316088c015F4BF27D86A1458A707af536A324': {
        index: 5,
        amount: '0x17ac67b42f025335c0',
        proof: [
          '0x4d787c6a670e10df084c7555ff831004b0da2a0b186318de0fa94ac1e037f8b8',
          '0xbf227486477385ca4bf78572899599ff8bb5db86dc8f25362eb29d57f3181660',
          '0x6925ada8634149f97e4fd8dd058341b54e07469e96f2b6f607c375d389f9bf0b',
          '0x3cc76f37533c2228ffd2d75a2f985b18d97a9d1bbe8f027d637fe948b5902571',
          '0xd5fdf5b88c97c01880e384fe4163b3420b9e1fcabb7269b9658059340a97bad8',
        ],
      },
      '0x397b2dA916Fd53d1db9758c65972c60a2c037d78': {
        index: 6,
        amount: '0xa590b1930144e78720',
        proof: [
          '0x6f2c673e0cd258536c729285cac9942ba3d15e5e43c2b14b4e118aa8caf79304',
          '0xc7eccf42d6bbbe76023237dc4d2478c3ba416b001fba9ee459a2e3f00869b745',
          '0x3d60f835210af491de006b1b5e436763d78dc1806ea84676dcc9bf81cdbcda23',
          '0x33906112c743a3df753fff34d82df1ecf50874c76dcc94f02514362f0093a590',
          '0xd5fdf5b88c97c01880e384fe4163b3420b9e1fcabb7269b9658059340a97bad8',
        ],
      },
      '0x3e7A4D888FC338BC4c7C7e81E2322486b65d5Cd0': {
        index: 7,
        amount: '0x1110d67bf82deb3540',
        proof: [
          '0xbd6536196197096a6d49e9362a7220ede80ea0ec88239f915d6ee2c3fd61a6f8',
          '0x297d8516ca54f98f86096778dd4d499531392e317b398ff526a1e298c6f251b6',
          '0xf75b88ff0e9f8fcc30ef5a6548f2264d92a7835845f9e5af9d6ade5ed5028925',
          '0x032eeb6d2735346d51e11cace59f6cbd1fe9f281f0024a44de74c36ec8bf423e',
        ],
      },
      '0x41D2a18E1DdACdAbFDdADB62e9AEE67c63070b76': {
        index: 8,
        amount: '0x11f1fa0a6773146620',
        proof: [
          '0x72e8ca2ab33a3d109e13cef74fa77cc335963e6c587e75d245942cfa55314120',
          '0xa2cc22685281958eb901ac3cbb923461e6cc069506cfd9f47639637e679f8c4d',
          '0x3d60f835210af491de006b1b5e436763d78dc1806ea84676dcc9bf81cdbcda23',
          '0x33906112c743a3df753fff34d82df1ecf50874c76dcc94f02514362f0093a590',
          '0xd5fdf5b88c97c01880e384fe4163b3420b9e1fcabb7269b9658059340a97bad8',
        ],
      },
      '0x51DE0FE79284b53f2473Dda5177e779813Af5649': {
        index: 9,
        amount: '0x37980d78e9c9e89640',
        proof: [
          '0x33a2a6fe0116811eac5e3db9c9c001a9aedaa3b5812d75e46a45eb560a54917a',
          '0xbf227486477385ca4bf78572899599ff8bb5db86dc8f25362eb29d57f3181660',
          '0x6925ada8634149f97e4fd8dd058341b54e07469e96f2b6f607c375d389f9bf0b',
          '0x3cc76f37533c2228ffd2d75a2f985b18d97a9d1bbe8f027d637fe948b5902571',
          '0xd5fdf5b88c97c01880e384fe4163b3420b9e1fcabb7269b9658059340a97bad8',
        ],
      },
      '0x521aacB43d89E1b8FFD64d9eF76B0a1074dEdaF8': {
        index: 10,
        amount: '0x795adbce14be166560',
        proof: [
          '0x642e84a909990078908f1004cdfce4dfccc16bf2277ff8c5754cc3f5a1e4b36f',
          '0xc7eccf42d6bbbe76023237dc4d2478c3ba416b001fba9ee459a2e3f00869b745',
          '0x3d60f835210af491de006b1b5e436763d78dc1806ea84676dcc9bf81cdbcda23',
          '0x33906112c743a3df753fff34d82df1ecf50874c76dcc94f02514362f0093a590',
          '0xd5fdf5b88c97c01880e384fe4163b3420b9e1fcabb7269b9658059340a97bad8',
        ],
      },
      '0x54727a65CC4f71418A29A6f18E5be808Efe89856': {
        index: 11,
        amount: '0x09dee794bcf35d0510',
        proof: [
          '0x2886eee71e14463a63c689b8a38a8c35dc2775d193d303a10d70b33b1b8ef3d8',
          '0x642cbe1d41b1a4b00f24cc889152a2cad0af46a65eb0bf1c666ec4b99d926704',
          '0x2a202d5c641b2ffdd86e3e34d1b8811233a42bb9faf998ab7494907db1833cf3',
          '0x3cc76f37533c2228ffd2d75a2f985b18d97a9d1bbe8f027d637fe948b5902571',
          '0xd5fdf5b88c97c01880e384fe4163b3420b9e1fcabb7269b9658059340a97bad8',
        ],
      },
      '0x59AE7f21D18b2F5fDC7a99c4fd6dD9E67Cec0Bc9': {
        index: 12,
        amount: '0x0e109c289e49d06590',
        proof: [
          '0x01d0f5bb1d929638ee582b13e02161a1f25d599d41f8a6369587766ad220b088',
          '0x227396216d4c84ae59da255f8207412bd74c04e7b2a7a6bc6e1b8ab4f6064c2b',
          '0x2a202d5c641b2ffdd86e3e34d1b8811233a42bb9faf998ab7494907db1833cf3',
          '0x3cc76f37533c2228ffd2d75a2f985b18d97a9d1bbe8f027d637fe948b5902571',
          '0xd5fdf5b88c97c01880e384fe4163b3420b9e1fcabb7269b9658059340a97bad8',
        ],
      },
      '0x5D603faE5ce6119a7a4296DeF1173535126ee999': {
        index: 13,
        amount: '0x246eea2a4f6a2c5d60',
        proof: [
          '0xc05ab6f90b357003580baa46e495dfed6100a8a0810d5f173ffa0116a3c623ba',
          '0x8f5ab4cc4ec4dfe14a7207f19dde11b15a2582eb9cbd8b7aec362b5c706e8e31',
          '0xf75b88ff0e9f8fcc30ef5a6548f2264d92a7835845f9e5af9d6ade5ed5028925',
          '0x032eeb6d2735346d51e11cace59f6cbd1fe9f281f0024a44de74c36ec8bf423e',
        ],
      },
      '0x5f6F655cefe99572293dCaf831fF391c38dF3b8B': {
        index: 14,
        amount: '0x1e1e550b8ef3583c60',
        proof: [
          '0x5080aeac56b0d056696666f5af265ca4fb7c4106d9987aad508b8e7fa6b16c49',
          '0xfcdebe07a9479e6a7b330f4fa2e4d91832747a76ef26fb250dc49e11b154cfc3',
          '0x032eeb6d2735346d51e11cace59f6cbd1fe9f281f0024a44de74c36ec8bf423e',
        ],
      },
      '0x644b37EA8027B81ef1bDCd10Ac0A78eA8532b7C8': {
        index: 15,
        amount: '0x067ec188a29c8779f0',
        proof: [
          '0xed507762928a48ef0cfa4f72234c47bee72e5bb65cf09a2e0568fb2cae31568a',
          '0xf83afc726365020067aaa3474b58d7edbcefb7a3fcae2c44f9295a045e8edd0f',
          '0xfcdebe07a9479e6a7b330f4fa2e4d91832747a76ef26fb250dc49e11b154cfc3',
          '0x032eeb6d2735346d51e11cace59f6cbd1fe9f281f0024a44de74c36ec8bf423e',
        ],
      },
      '0x756239E5B7D2aa6F3DA0594B296952121Fb71606': {
        index: 16,
        amount: '0xe215847ce851cb66e0',
        proof: [
          '0x9637b513ad76ada5b9c467908ebd8ff7dfe1696f959535c8edc6fda860db3826',
          '0xaa6d1aa452856ff7c4e0219bfc24647a5053f08cd0c94d13622b3f65b7c65f16',
          '0xc2c0e4a825324acf35a271a99c20e925c66e4e930dc4509376378922ebbae387',
          '0x33906112c743a3df753fff34d82df1ecf50874c76dcc94f02514362f0093a590',
          '0xd5fdf5b88c97c01880e384fe4163b3420b9e1fcabb7269b9658059340a97bad8',
        ],
      },
      '0x7e30FB962f951ef78D901865F87DD036fc5aa946': {
        index: 17,
        amount: '0x093ff036346bbbefe0',
        proof: [
          '0xa699747cfe15d5a8b723e57e48f38ebfa13d21b5490ee83f9f0cc9afad273af1',
          '0xaa6d1aa452856ff7c4e0219bfc24647a5053f08cd0c94d13622b3f65b7c65f16',
          '0xc2c0e4a825324acf35a271a99c20e925c66e4e930dc4509376378922ebbae387',
          '0x33906112c743a3df753fff34d82df1ecf50874c76dcc94f02514362f0093a590',
          '0xd5fdf5b88c97c01880e384fe4163b3420b9e1fcabb7269b9658059340a97bad8',
        ],
      },
      '0xA4704B83dd29c36eEB6e0bCA545F45eCd84AaF9C': {
        index: 18,
        amount: '0x0574c652099dc18fc0',
        proof: [
          '0xbc864cde30d532a36bce2d304ab4fad407292098d200b54b482efa495801d927',
          '0x297d8516ca54f98f86096778dd4d499531392e317b398ff526a1e298c6f251b6',
          '0xf75b88ff0e9f8fcc30ef5a6548f2264d92a7835845f9e5af9d6ade5ed5028925',
          '0x032eeb6d2735346d51e11cace59f6cbd1fe9f281f0024a44de74c36ec8bf423e',
        ],
      },
      '0xBADCdDEA250f1e317Ba59999232464933C4E8D90': {
        index: 19,
        amount: '0x622f802f908b209600',
        proof: [
          '0xb026ed5531fff798ff2a6530c9131b50efcc1f3aac46b896fbaf8685a2560834',
          '0xac21fe9367a5da5bf5cf56873a863594897f1fe7b7a4c0d87291e4da2737b74a',
          '0xc2c0e4a825324acf35a271a99c20e925c66e4e930dc4509376378922ebbae387',
          '0x33906112c743a3df753fff34d82df1ecf50874c76dcc94f02514362f0093a590',
          '0xd5fdf5b88c97c01880e384fe4163b3420b9e1fcabb7269b9658059340a97bad8',
        ],
      },
      '0xf503017D7baF7FBC0fff7492b751025c6A78179b': {
        index: 20,
        amount: '0xee7dd823e4f71a7440',
        proof: [
          '0x0a8f064ab52b99bdf33371b74c63829e10d96a2ebe83cf876c1623160fc11e0e',
          '0x642cbe1d41b1a4b00f24cc889152a2cad0af46a65eb0bf1c666ec4b99d926704',
          '0x2a202d5c641b2ffdd86e3e34d1b8811233a42bb9faf998ab7494907db1833cf3',
          '0x3cc76f37533c2228ffd2d75a2f985b18d97a9d1bbe8f027d637fe948b5902571',
          '0xd5fdf5b88c97c01880e384fe4163b3420b9e1fcabb7269b9658059340a97bad8',
        ],
      },
      '0xfa0902DBbf44C778c959f919BC4915ef23787140': {
        index: 21,
        amount: '0x1d1fbe35d8491357c0',
        proof: [
          '0xdacce957d55f97ae4ee754bf9dcee067a49b7e79f5d8865b0e769c6205cc8ca8',
          '0x8f5ab4cc4ec4dfe14a7207f19dde11b15a2582eb9cbd8b7aec362b5c706e8e31',
          '0xf75b88ff0e9f8fcc30ef5a6548f2264d92a7835845f9e5af9d6ade5ed5028925',
          '0x032eeb6d2735346d51e11cace59f6cbd1fe9f281f0024a44de74c36ec8bf423e',
        ],
      },
      '0xfb0A07F4B89A46997e036d8D5202Bba3ab9831d5': {
        index: 22,
        amount: '0x7bee7b5c25a1ab1f40',
        proof: [
          '0x793adaf7bb8182122d564dfa9710e1da4e24a4d474bbb96dead313e928910369',
          '0xa2cc22685281958eb901ac3cbb923461e6cc069506cfd9f47639637e679f8c4d',
          '0x3d60f835210af491de006b1b5e436763d78dc1806ea84676dcc9bf81cdbcda23',
          '0x33906112c743a3df753fff34d82df1ecf50874c76dcc94f02514362f0093a590',
          '0xd5fdf5b88c97c01880e384fe4163b3420b9e1fcabb7269b9658059340a97bad8',
        ],
      },
    },
  },
  hash: '0xf4c9cc27aa6153b78311c90cec9807a9ca5b969952f9b1c50c70f69fedbb8f55',
};
