# `@dgrants/dcurve`

This package allows you to create a distribution for a specific GrantRound based on the contributions recieved by the Grants.

This can intended to be used
  - by the dApp hosting dGrants to
    - generate the CLR distribution at the end of the round
    - how the prediction would vary for a grant it it were to receive a contribution on value X
  - as a standalone to allow members of the DAO to be able to verify the distribution themselves to ensure the results are correct



## Structure 

```
.
├── src                    
│   ├── README.md           # Getting started guide
│   ├── types.ts            # Typescript types
|   ├── index.ts            # What client imports 
│   ├── internal            
│       ├── calc            # Contains impls of CLR algorithm
│       ├── hash            # Contains impls of hash algorithms
|       ├── fetch.ts        # fetch information from chain
|       ├── main.ts         # orchestrator 
└── ...
```


### fetch.ts

Exports function `fetch` which allows dApp to fetch contributions made to a Grant via the [GrantRoundManager](https://github.com/dcgtc/dgrants/blob/main/contracts/contracts/GrantRoundManager.sol) contract

Argument Object: GrantRoundFetchArgs
Response Object: GrantRoundContributions

note: this can be overridden and fed into calculate , predict function as long as it response conforms to the structure of GrantRoundContributions


### internal/cal (mandatory)

This folder lists out the different QF algorithms supported by dcurve
and would need to be set when creating a new instance of CLR object

| QF algorithm | How to import                               | Description                     |
|--------------|---------------------------------------------|---------------------------------|
| linear       | `import { linear } from @dgrants/dcurve;`   | This is QF without pairwise     |
| pairwise     | `import { pairwise } from @dgrants/dcurve;` | This is QF which uses pairwise  |


```javascript
import { linear, CLR } from @dgrants/dcurve;
const options = {
  'calcAlgo' : linear,
  'hashAlgo' : '...'
}
const clr = new CLR(options);
```

### internal/cal (mandatory)

This folder lists out the different hash algorithms supported by dcurve
and would need to be set when creating a new instance of CLR object


| Hash algorithm | How to import                             | Description            |
|----------------|-------------------------------------------|------------------------|
| `sha256`       | `import { sha256 } from @dgrants/dcurve;` | uses the ethers.sha256 |

```javascript
import { sha256, CLR } from @dgrants/dcurve;
const options = {
  'calcAlgo' : '...',
  'hashAlgo' : sha256
}
const clr = new CLR(options);
```

## Usage

```
// 1. Import the 
//  - CLR algorithm
//  - hashing algorithm
//  - fetch 
import { linear } from @dgrants/dcurve;
import { sha256 } from @dgrants/dcurve;
import { fetch } from @dgrants/dcurve;
import { CLR } from @dgrants/dcurve;

// 2. Create instance of CLR 
const options = {
  'calcAlgo' : linear,
  'hashAlgo' : sha256
}
const clr = new CLR(options)

// 3. Fetch contributions

const grantRound = '';
const registry = '';

const contributions = fetch(grantRound, registry);


# 4. Calculate Distribution
const distribution = clr.calculate(contributions)

# 5. Predict match for a grant
const grantId = '';
const predicitionPoints = [1, 10];
const prediction = clr.predict(contributions, grantId, predictionPoints)
```
