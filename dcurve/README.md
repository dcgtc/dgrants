# `@dgrants/dcurve`

This package allows you to create a distribution for a specific GrantRound based on the contributions recieved by the Grants.

This package is intended to be used

- by the dApp hosting dGrants to
  - generate the CLR distribution at the end of the round
  - how the prediction would vary for a grant it it were to receive an additional contribution of value X
- as a standalone CLI tool to allow members of the DAO to verify the distribution/merkle root themselves to ensure that the results are correct

## Structure

```
.
├── src
│   ├── README.md               # getting started guide
│   ├── types.ts                # typescript types
|   ├── index.ts                # root of the project, exporting public interface
│   ├── internal
│       ├── calc                # folder containing implementations of CLR algorithms
│       ├── merkle.ts           # file containing implementations to generate merkle-root and claims
|       ├── fetch.ts            # fetch information from chain
|       ├── clr.ts              # orchestrator
└── ...
```

### fetch.ts

Exports function `fetch` which allows dApp to fetch contributions made to a Grant via the [GrantRoundManager](https://github.com/dcgtc/dgrants/blob/main/contracts/contracts/GrantRoundManager.sol) contract

Argument Object: GrantRoundFetchArgs
Response Object: GrantRoundContributions

note: this can be overridden and contributions can be fed directly into `calculate`/`predict`, so long as the input conforms to the structure of `GrantRoundContributions`

### calc/\*.ts

This folder lists out the different QF algorithms supported by dcurve
and would need to be set when creating a new instance of CLR object

| QF algorithm | How to import                               | Description                                  |
| ------------ | ------------------------------------------- | -------------------------------------------- |
| linear       | `import { linear } from @dgrants/dcurve;`   | The non-pairwise, original quadratic matching formula makes the inherent assumption that all agents participating in a grant round are fully uncoordinated. Therefore, we follow the formula where the amount received by a grant is proportional to the square of the sum of the square roots of contributions received less the sum of the total contributions for the grant.|
| pairwise     | `import { pairwise } from @dgrants/dcurve;` | The pairwise quadratic matching formula takes into account that some agents are coordinating while contributing to grants and that this coordination should be penalized.

This can be represented mathematically as a coordination coefficient, 1 if the agents are fully uncoordinated and 0 (no matching should occur) if the agents are fully coordinated. This is theoretical of course, and the applicable concept is that the more coordinated a pair of contributors are, the higher the penalty. In order to discover the level of coordination between users for each grant, this means we must take a permutation of all contributors who contributed to a grant and look across how many grants they both contributed to, to assess how much penalty a user pair would incur.

The trade off is the calculation speed of the formula and the inherent collusion resistance. Non-pairwise gives us faster calculation speeds and the possibility of accurately estimating CLR match amounts with no collusion detection. Pairwise, to some degree, protects against collusion tactics, but the complexity and overhead of running user to user permutations puts limitations on predicting match amounts and quickly running calculations.
 (coming soon) |

```javascript
import { linear, CLR } from @dgrants/dcurve;
const initArgs = {
  'calcAlgo' : linear,
  'includePayouts' : false
}
const clr = new CLR(initArgs);
```

### merkle.ts

This file contains the logic to

- generate merkle root of the distribution
- generate/return a proof for a claim

This logic has been ported over from [Uniswap/merkle-distributor](https://github.com/Uniswap/merkle-distributor) and provides means to generate a merkle root given the final distribution.

This is what will be uploaded to the `GrantRoundPayout.sol` contract

### clr.ts

This file orchestrates the calculation and prediction procedure, exposing two methods, `calculate` & `predict`.

## Usage

```
// 1. Import the
//  - fetch
//  - CLR algorithm
//  - CLR class
import { fetch, linear, CLR } from @dgrants/dcurve;

// 2. Create instance of CLR

const initArgs = {
  calcAlgo: linear
};
const clr = new CLR(options);

// 3. Fetch contributions

const grantRoundFetchArgs = {
  provider: provider,
  grantRound: GRANT_ROUND_ADDRESS,
  grantRoundManager: GRANT_ROUND_MANAGER_ADDRESS,
  grantRegistry: GRANT_REGISTRY_ADDRESS,
  supportedTokens: SUPPORTED_TOKENS_MAPPING,
  ignore: {
    grants: [],
    contributionAddress: []
  }
};
const grantRoundContributions = fetch(fetchArgs);

// 4. Calculate Distribution

const distribution = clr.calculate(grantRoundContributions);

// 5. Predict match for a grant

const grantPredictionArgs = {
  grantId: 1,
  predictionPoints: [1, 10, 100],
  grantRoundContributions: contributions
};
const prediction = clr.predict(predictArgs);
```
