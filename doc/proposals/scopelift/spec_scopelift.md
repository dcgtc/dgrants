# **Decentralizing Gitcoin Grants**

This post is a kickoff to the process of creating a decentralized version of the Gitcoin Grants system. In it, we’ll summarize the goals and ethos of the project, as well as the high level architecture and foreseen challenges. We invite feedback on any and all portions of this document. Community involvement in this process is imperative to its success.


##
**Unpacking “Decentralized”**

The word “decentralized” is overloaded in the crypto world. A useful starting point is to unpack this term into more precise ones, and to specify which form(s) of decentralization the Gitcoin Grants project will aim for.


###
**Rigid Decentralization**

In its strongest form, decentralization can be interpreted to mean automatic, immutable, and maximally censorship resistant. In the abstract, these are worthy properties to pursue. However, there are some contexts where they are not yet attainable, for at least one of two reasons:



1. Technological limitations put those properties out of reach. For example, “storing terabytes of immutable data permanently” is effectively impossible in a decentralized fashion today.
2. The nature of a given use case is simply opposed to these properties in a fundamental way. For example, making moral or ethical judgements about the worthiness of one thing over another is definitionally opposed to an automated system— it is a matter of human values and requires human(s) in the loop.

###
**Flexible Decentralization**


In cases where “rigid decentralization” is not attainable, there are many other aspects of decentralization which still apply. These include properties such as verifiability, community ownership, non-gatedness, distribution, trust minimization and many others.

As a principle, Gitcoin Grants will aim for Rigid Decentralization wherever possible.

Where there is a technical limitation that currently prevents rigid decentralization, Gitcion Grants will opt for a flexible alternative that can one day progress to a more rigidly decentralized solution when possible.

In addition to adopting such solutions when developed by others, Gitcoin Grants will pursue the development of solutions to some of these problems within its own community. Where possible, Gitcoin Grants will dog food Gitcoin Grants to fund the development of such technologies.

Where rigid decentralization is impossible due to a fundamental opposition to Gitcoin Grant’s mission, Gitcoin will nonetheless strive for maximal decentralization along those axes where it is impossible. For example: deciding which grants do or don’t qualify for matching is by definition a matter of human judgment, but we can strive to give the broader community the ability to exercise this judgment as it sees fit.

Verifiability and community ownership will be two pillars of this effort. Wherever possible, participants in Gitcoin Grants should be able to verify the integrity of the system independently, and empowered to make changes to any special privileges granted in the system via proposals to the GTC Dao.


##
**Core Components**

Here we enumerate the core entities in the Gitcoin Grants system, that is those that flow naturally out of the desired behaviors.

This section presumes a basic knowledge of the existing, mostly-centralized Gitcoin Grants product, and with underlying concepts such as Quadratic Funding, etc… If you’re not yet familiar with Gitcoin Grants, consider researching it a bit first, starting with the [Gitcoin Grants FAQ](https://gitcoin.co/grants/quickstart).


####
**Grant**



* Has a unique on-chain identifier
* Has metadata, such as a title, description, team members, etc.
* Has an owner
* Has an address to receive funds

####
**Round**

* Has a pool of matching funds
* Has a set of qualifying grants
* Has a start and end date
* Has many contributions
* Has a matching function
* Has matching payouts

####
**Contribution**

* Has a token/currency
* Has an amount
* Has an associated Round
* Has a receiving Grant

####
**Matching Donor**

* Gives funds to a Round before it starts
* -OR- Gives funds to the Gitcoin DAO which puts it into Rounds

####
**Grant Donor**

* Makes Contributions to Grants during a Round

####
**Matching Function**

* Inputs: Contributions
* Outputs: Matching Payouts

####
**Matching Payout**

* Has a (Grant) recipient
* Has an amount

##
**Core Decentralization Challenges**


In this section, we seek to elucidate the core challenges that come with attempting to implement the Gitcoin Grants system in a decentralized way. We’re not aiming to discuss implementation details or UX challenges in this section, but rather the intrinsic challenges that come along with a decentralized version of Gitcoin Grants.

Put another way: imagine attempting a naive smart contract implementation of the components defined above. Where would such an implementation become unworkable, and/or run into fundamental problems when actually used in the wild? We aim to anticipate those challenges in particular here.

To some extent, each of these is a problem for the existing Gitcoin Grants product. The challenge is amplified when attempting to solve them in a decentralized way.


###
**Sybil Attack Protection**

By far the most fundamental problem for a decentralized Grants Round is that of sybil attacks. Namely, there is a huge incentive for Grant owners to impersonate organic supporters, making many contributions to their own Grant in order to boost their Matching Payout.

This issue falls somewhere in between a technical challenge and a matter of judgment. While recognizing another human as human does at some level ultimately require human judgment, there are nonetheless technical approaches that can increase the cost of impersonation such that it becomes prohibitive for a would be attacker.

Sybil protection is one of the fundamental challenges of the crypto world. While no one has “solved” the problem, there are many projects attempting to mitigate it via methods across a broad spectrum of complexity and decentralization.


###
**Grant Validation and Qualification**

Another core challenge for a decentralized version of Grants is the validation and qualification of Grants themselves. This issue falls into that category of challenge wherein the goal is fundamentally at odds with rigid decentralization. Deciding what grants qualify or don’t is fundamentally a value judgment that must require human(s) in the loop.

The spectrum of judgements to be made here is also quite broad. It ranges from obvious fraud (e.g. individuals pretending to represent a project they’re unaffiliated with) to much more nuanced concepts of fairness (for example, should a project that did a token sale or raised venture capital be allowed to participate).


###
**Matching Function Computation**

Running the computation to determine the match payouts is computationally intensive relative to what is possible on-chain. It requires tracking and iterating over thousands of Contributions per round and applying whatever predetermined quadratic matching algorithm has been chosen.

This problem falls squarely in the category of a technical challenge. The matching function is deterministic and can be set ahead of time. The limitation is purely one relating to computational bandwidth on decentralized networks.


###
**Grants Metadata Storage**

Each grant has a sizable amount of metadata associated with it, including but not limited to a project image, title, description, and other fields. Storing this data on-chain is prohibitively expensive. Furthermore, being able to update the data is desired, which only makes on-chain storage more impractical.

While various decentralized data networks exist, many either make compromises (such as IPFS does on data availability guarantees) or are early and untested. Furthermore, even if a robust decentralized storage network exists, anchoring data stored there to the Grant instance on chain is also challenging.

This problem again falls clearly into the category of technical challenge.


##
**MVP Approach**

This section details the development approach we hope to take for decentralizing Gitcoin Grants. At a high level, the methodology can be summarized in three words: ship, learn, iterate.

In particular, the hope is to develop a barebones, end-to-end implementation of the decentralized project, deploy it, and use it to run a small matching round by [DATE].

Such an MVP or “v0” of the project will first seek to implement simple versions of the core components listed above. Afterwards, we’ll seek to apply flexible, semi-decentralized mitigations to the core challenges listed above, leaning heavily on the concepts of verifiability and community (DAO) provenance. Where possible, we’ll seek to place these mitigation efforts behind abstraction barriers, such that more advanced systems can be applied in the future without significant changes to the core architecture.

After running a v0 round, we can assess what worked, what didn’t, and iterate. In addition to round-to-round improvements, we can also spool up longer running efforts to develop robust solutions to various challenges. Running the rounds will surely surface new challenges to address as well.

Below, we sketch out some initial thoughts on how to approach each of the core challenges in a v0. These suggestions should be considered as starting points in the discussion, and not even close to finalized decisions.


###
**Sybil Attack Mitigation**



* A “sybil modifier” contract could track a sybil score of every contributor
* By default, this score for a “new” address would be assumed as 50% matching power, as is currently done for new accounts on the existing Gitcoin Grants product
* A privileged account in the system would have the ability to increase or decrease this sybil score for any user
* Gitcoin could be given the privileged role to modify sybil scores, and could do so according to its existing “Trust Bonus,” score, which is a combination of various anti-sybil tools with which users can demonstrate their humanness to Gitcoin.
* Gitcoin could consider some way of “showing their work” on the sybil scores assigned to each account, i.e. making them public
* Another admin role could have the ability to reassign the sybil-modifier role. This could be held by the Gitcoin DAO.

###
**Grant Validation and Qualification Approach**

* When a grants round is initialized, the round creator could specify an initial list of approved grants
* A grants round could have a special approver account that has privileges to approve or remove a grant
* In the first round, the approver could be a Gitcoin account or multi-sig
* There could be an additional admin role that could change the privileged approver
* The admin who can change the approver could be the GTC DAO for the first round

###
**Matching Function Computation Abstraction**

* The round could completely abstract away the work of calculating the matching round by simply having a `transferToPayoutContract` function that sends matching funds to a specified account, and can only be called by a privileged role \
*Furthermore, the GTC DAO could fill the privileged role of transferring the funds to the payout contract \
*To facilitate this, we could develop an open source script to track contributions, apply the QF function, and generate a Merkle distributor contract \
*Finally, the GTC DAO could check our work and approve/reject the payout contract create
* We can also explore trust-minimized off-chain computation solutions such as TrueBit or solutions leveraging technologies like zkProofs

###
**Grants Metadata Storage Approach**

* Some essential metadata will be stored on chain, such as the payout address
* The Grant contract could additionally store an IPNS hash that is set by the grant creator for non-essential metadata
* Grant clients could load the content at the IPNS hash to show to the user this data
* The client would assume the metadata stored at the location to which the IPNS hash resolves conforms to some expected schema
* We could create a simple frontend that allowed for setting and pinning the relevant data to IPFS, in the appropriate schema, using a service like Fleek
* We could create an open source caching/indexing layer to enable searching, etc…

##
**Final Considerations**


This section is a catch all for additional considerations that might be of note.


###
**Layer 2 / Sidechains**

Even for a simplified, barebones MVP, the frequency of on-chain interactions required might make a mainnet deployment of the product prohibitive, especially if gas prices remain high. It would be prudent to develop the contracts in such a way as to maintain compatibility with the increasingly robust ecosystem of scaling solutions. These include, but are not limited to, Optimism, Arbitrum, zkSync, StarkWare, Polygon, xDai and others.

One consideration if an L2 / sidechain is chosen is how the GTC DAO can express its preferences there.


###
**GTC DAO Security**

As articulated at various points in this document, a core leg of creating a decentralized Gitcoin is to give the GTC DAO control over many aspects of the system, enabling community ownership and distributed decision-making.

It will be important, then, to consider the security of the DAO as the decentralized Grants project progresses. At some point, having influence over various components of Decentralized Grants could be lucrative enough to incentivize some form of social / economic attack on the DAO itself.

