# dGrants Protocol Specification
Protocol specification for Decentralized Grants

## Abstract
[todo]

## Status of This Document
This document outlines the protocol for Gitcoins Decentralized Grants. All of the contents of this document and linked documents is currently in flux. Once a stable state is reached, the protocol will be versioned and frozen to breaking changes.

## Introduction
This protocol is broken up into a few logical pieces representing the composable parts that form the overall dGrants protocol.

### A Simple Example

### Design Goals

### Architecture Overview

## Terminology


## dGrants Core
The dGrants Core modules form the primary components of the dGrants protocol.

### Contract Upgradability
[todo]

### Grant Registry
- GrantRegistry contracts can be deployed to one or more EVM compatible blockchains
- A root contract should be deployed to one of these chains containing the list of all deployed GrantRegistry contracts
    - [add list/contract specification]
- Grants in the grant registry contract should be able to be created by anyone and should contain the following
    - [identify contents and format of grants]
- Grant eligibility should not be done in the GrantRegistry contracts and is covered under Grant Curation - Eligibility & Discovery

#### Grant Registry Contract Specification
- Contract Interfaces
- Data Formats
- Update/Change Guidelines

### Grant Rounds
Grant rounds add the ability for a single pool of funds to be distributed to a group of grants at the end of the round based on various factors.
- GrantRounds should have a start and end time or block
- [more]

### Curator Contract

### Metadata Schema
[should be exendable and upgradable]

### On Chain Metadata Validation

### Metadata Updates & Versioning

### Grant Updates & Curation (grant approval / re-approval)


## dGrants UI

### Grant Explorer
A grant explorer is some type of user interface which consumes grants; and their related content, and grant rounds from one or more GrantRegistries, makes them easily browsable by end users, and allows donations to be made to Grants.

## dGrants Modules

### Grant Curation - Eligibility & Discovery

#### Eligibility Options
In the Grant Explorer, only grants that are approved (in the inclusive case) or not excluded (in the exclusive case) should be displayed.
- Inclusive - Grants IDs should be added to a list in order to be included in the displayed grants and pass the filter
- Exclusive - Grant IDs should be added to a list in order to be excluded from the displayed grants showing all grants found in the grant registry that are not included in this list
- Any number of mechanisms could be used to generate these lists, here are some examples
    - Staking
    - Manual or automated review process

#### Discovery Options
One option for the order of grants listed should be based on its discovery score.
- The discovery score should be an INT between 0 and 99
- The higher the score, the more prominent the grant should be in the list
- These scores should be retrieved from a list containing key value pairs where the key is the GrantID and the value is the grants discovery score

### Sybil Resistance
Sybil resistance is necessary when utilizing quadratic funding due to fact that more donations from unique users results in a higher payout from a Grant Rounds matching pool. Sybil resistance should be approached in the following ways.
- Proactive Sybil Resistance
    - Before 
- Reactive Sybil Resistance

#### Sybil Score
Request
1) Check if the user has a DID or dPOPP connected to their sign in address
2) If so, check them for sybil score data packet
```
ID: ????
```

Response
```
Score: [0-99]
Signature: XXX

```

#### Profiles (package the sybil score and unique ID)

### Matching Calculation & Payouts
After a Grant Round has ended, the matching funds must be distributed to the qualified grants (define) in the round based on the desired mechanism. While one could choose any method of payout calculation, the dGrants protocol focuses on implementing various approaches to quadratic funding (define) which we will outline here.

### Fraud Detection & Defense
Used for
Denying grants (see Grant Eligibility) from being displayed in a Grant Explorer

## dGrants Library
The dGrants library is a set of tools that can be imported and implemented in your codebase. This section describes the [...continue]








