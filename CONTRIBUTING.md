# Contributing to dGrants

A big welcome and thank you for considering contributing to the dGrants open source project! It’s people like you that make it a reality for users in our community.

Reading and following these guidelines will help us make the contribution process easy and effective for everyone involved. It also communicates that you agree to respect the time of the developers managing and developing these open source projects. In return, we will reciprocate that respect by addressing your issue, assessing changes, and helping you finalize your pull requests.

## Quicklinks

* [Code of Conduct](#code-of-conduct)
* [Getting Started](#getting-started)
    * [Ideas](#ideas)
    * [Discussions](#discussions)
    * [Issues](#issues)
    * [Pull Requests](#pull-requests)
      * [Git Rebase Workflow](#git-rebase-workflow)
    * [Show and Tell](#show-and-tell)
    * [Development Process](#development-process)
* [Getting Help](#getting-help)

## Code of Conduct

Contributions to Gitcoin are governed by the [Contributor Covenant version 1.4](https://www.contributor-covenant.org/version/1/4/code-of-conduct.html).
All contributors and participants agree to abide by its terms. To report
violations, shoot out an email to philip@gitcoin.co

The Code of Conduct is designed and intended, above all else, to help establish
a culture within the project that allows anyone and everyone who wants to
contribute to feel safe doing so.

Open, diverse, and inclusive communities live and die on the basis of trust.
Contributors can disagree with one another so long as they are done in good
faith and everyone is working towards a common goal.

## Getting Started

Contributions are made to this repo via Ideas, Discussions, Issues and Pull Requests (PRs).

[Discussions > Ideas](https://github.com/dcgtc/dgrants/discussions/categories/ideas) - Propose and discuss ideas for new features or changes not currently in the dGrants design/architecture
[Discussions > Architecture & Design](https://github.com/dcgtc/dgrants/discussions/categories/architecture-design) - Propose and discuss architecture and design for features or components in the current design that do not have clear or detailed definition
[Issues](https://github.com/dcgtc/dgrants/issues) - Report problems with dGrants or add work to be done on a feature that is within the scope of the current design/architecture


A few general guidelines that cover these:
- Search for existing Descriptions, Issues and PRs before creating your own.
- We work hard to makes sure issues are handled in a timely manner but, depending on the impact, it could take a while to investigate the root cause. A friendly ping in the comment thread to the submitter or a contributor can help draw attention if your issue is blocking.

**Additional Discussion Areas**
[Discussions > Dev Meta](https://github.com/dcgtc/dgrants/discussions/categories/dev-meta) - Discuss development process, CI/CD, and similar topics here
[Discussions > Show and Tell](https://github.com/dcgtc/dgrants/discussions/categories/show-and-tell) - Share something that you've built on top of or using the dGrants platform

### Discussions > Ideas
Submit an Idea when requesting a new feature, or update an existing feature that is not currently identified in the dGrants architecture or scope.

### Discussions > Architecture & Design
Discussion should be used to discuss potential changes before an issue or PR is created, or discussing the implementation on a current feature. Once the discussion has ended with participation from the community and maintainers, if changes need to made to the codebase, follow it up by creating an issue.

### Issues
Issues should be used to report problems with the dApp, or capture work to be done for features within the scope of the current architecture that are well defined. When you create a new Issue, a template will be loaded that will guide you through collecting and providing the information we need to investigate.

If you find an Issue that addresses the problem you're having, please add your own reproduction information to the existing issue rather than creating a new one. Adding a [reaction](https://github.blog/2016-03-10-add-reactions-to-pull-requests-issues-and-comments/) can also help be indicating to our maintainers that a particular problem is affecting more than just the reporter.

When creating a new issue, please do your best to be as detailed and specific as possible.

### Pull Requests

PRs to our repo are always welcome and can be a quick way to get your fix or improvement slated for the next release. In general, PRs should:

- Should have a correspoding issue created.
- Only fix/add the functionality described on the issue to ensure reviews are clean and well-scoped
- Add tests if there is changed functionality and ensure all tests continue to pass.
- Address a single concern in the least number of changed lines as possible.
- Be accompanied by a complete Pull Request template (loaded automatically when a PR is created).
- Mark your PRs as draft until it's ready for review.
- Ensure the title and description is clear explains what the PR achieves or addresses. (Attach screenshot/recording if changes are made to the frontend)
- The PR passes all CI checks

_Note: If tests are failing or coverage is decreased while adding logic to any backend code, you will be asked to include relevant tests and your PR will not be merged until all checks pass._


For changes that address core functionality or would require breaking changes (e.g. a major release), it's best to open an discussion discuss your proposal first, follow that up by creating an issue which lists the changes needed before opening up the PR.

In general, we follow the ["fork-and-pull" Git workflow](https://github.com/susam/gitpr)

1. Fork the repository to your own Github account
2. Clone the project to your machine
3. Create a branch locally with a succinct but descriptive name
4. Commit changes to the branch in logical chunks. Please adhere to these [git commit message guidelines](https://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html). Use Git's interactive rebase feature to tidy up your commits before making them public.
5. Following any formatting and testing guidelines specific to this repo
6. Push changes to your fork
7. Open a PR in our repository and follow the PR template so that we can efficiently review the changes.

NOTE: Before rasing a PR, ensure your branch is truly ahead of main branch. Avoid merge commits. Always rebase to ensure a clean commit history for your PR

#### Git Rebase Workflow

dGrants follows a rebase workflow, rather than a merge workflow. Each new feature should be developed in an independent, short running branch

```bash
git checkout -b my-feature-branch
```

The developer or developers working on said feature are responsible for keeping it up to date with `main`, that is, rebasing their branch to `main` as it evolves.

```bash
git checkout main
git pull origin main # get the latest
git checkout my-feature-branch
git rebase my-feature-branch main
```

If conflicts are found, you will have to resolve them now. See [here](https://docs.github.com/en/get-started/using-git/resolving-merge-conflicts-after-a-git-rebase) for more info on resolving merge conflicts when rebasing. After successfully rebasing, force push back to your feature branch, but *never* force push to `main`:

```bash
git push origin my-feature-branch --force
```

Every PR merged should merged with GitHub's "Rebase and Merge" button, or with a fast-forward merge on the command line, like:

```bash
git checkout main
git merge my-feature-branch --ff-only
git push origin HEAD # This will close the PR
```

#### Advantages of Rebase Workflow

* Encourages short-running feature branches with fewer opportunities for merge conflicts
* Encourages the developer of the feature to be the one that resolves merge conflicts related to said feature, reducing the likelihood of a bug or regression slipping in due to conflict resolution
* Keeps commit history clean and easy to read


## Getting Help

Join us in the [#decentralize-gitcoin](https://discord.gg/PtBTBM6D) channel on discord and post your question / suggestions / to see the progress the community is making on building the repo
