# `@dgrants/dcurve`

> TODO: description

## Usage

```
const dcurve = require('@dgrants/dcurve');

// TODO: DEMONSTRATE API
```


- If Donations provided ->
    - calculate distribution curve (input: how much in token )

- If Donations aren't provided ->
    - grant registry address
    - CLR round

    our module 
        -> fetch Grants 
        -> fetch Donations 
        -> calculate distribution curve


Distribution Function
    - matching_algo -> pairwise |  default: linear 
    - hashing_algo -> default: SHA256


Once the curve -> 
    Does this module -> create the DistributionProposal 
    OR WOULD DAPP TAKE create 
