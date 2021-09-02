# Contributing to dGrants

A big welcome and thank you for considering contributing to the dGrants open source project! It’s people like you that make it a reality for users in our community.

Reading and following these guidelines will help us make the contribution process easy and effective for everyone involved. It also communicates that you agree to respect the time of the developers managing and developing these open source projects. In return, we will reciprocate that respect by addressing your issue, assessing changes, and helping you finalize your pull requests.

## Quicklinks

- [Contributing to dGrants](#contributing-to-dgrants)
  - [Quicklinks](#quicklinks)
  - [Code of Conduct](#code-of-conduct)
  - [Getting Started](#getting-started)
    - [Discussions](#discussions)
      - [Ideas](#ideas)
      - [Architecture & Design](#architecture--design)
    - [Dev Meta](#dev-meta)
    - [Show and Tell](#show-and-tell)
    - [Issues](#issues)
    - [Pull Requests](#pull-requests)
      - [Git Rebase Workflow](#git-rebase-workflow)
      - [Advantages of Rebase Workflow](#advantages-of-rebase-workflow)
  - [App Contribution Guidelines](#app-contribution-guidelines)
    - [Overview](#overview)
    - [Composition API](#composition-api)
    - [State Management](#state-management)
    - [Other Notes](#other-notes)
  - [Getting Help](#getting-help)

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

- [Discussions > Ideas](https://github.com/dcgtc/dgrants/discussions/categories/ideas) - Propose and discuss ideas for new features or changes not currently in the dGrants design/architecture
- [Discussions > Architecture & Design](https://github.com/dcgtc/dgrants/discussions/categories/architecture-design) - Propose and discuss architecture and design for features or components in the current design that do not have clear or detailed definition
- [Issues](https://github.com/dcgtc/dgrants/issues) - Report problems with dGrants or add work to be done on a feature that is within the scope of the current design/architecture

**Other Discussion Channels**

- [Discussions > Dev Meta](https://github.com/dcgtc/dgrants/discussions/categories/dev-meta) - Discuss development process, CI/CD, and similar topics here
- [Discussions > Show and Tell](https://github.com/dcgtc/dgrants/discussions/categories/show-and-tell) - Share something that you've built on top of or using the dGrants platform

A few general guidelines that cover these:

- Search for existing Discussions, Issues and PRs before creating your own.
- We work hard to makes sure issues are handled in a timely manner but, depending on the impact, it could take a while to investigate the root cause. A friendly ping in the comment thread to the submitter or a contributor can help draw attention if your issue is blocking.


### Discussions

#### Ideas
Submit an Idea when requesting a new feature, or update an existing feature that is not currently identified in the dGrants architecture or scope.

View: [Ideas](https://github.com/dcgtc/dgrants/discussions/categories/ideas)

#### Architecture & Design

Discussion should be used to discuss potential changes before an issue or PR is created, or discussing the implementation on a current feature. Once the discussion has ended with participation from the community and maintainers, if changes need to made to the codebase, follow it up by creating an issue.

View: [Architecture & Design Discussions.](https://github.com/dcgtc/dgrants/discussions/categories/architecture-design)

### Dev Meta

Discussions related to development process, CI/CD, and similar topics here. (AKA which affect the how we work)

View: [Dev meta](https://github.com/dcgtc/dgrants/discussions/categories/dev-meta)

### Show and Tell

Meant to showcase applications which have been built on top of the dGrants platform

View: [Show and Tell](https://github.com/dcgtc/dgrants/discussions/categories/dev-meta)

### Issues

Issues should be used to report problems with the dApp, or capture work to be done for features within the scope of the current architecture that are well defined. When you create a new Issue, a template will be loaded that will guide you through collecting and providing the information we need to investigate.

If you find an Issue that addresses the problem you're having, please add your own reproduction information to the existing issue rather than creating a new one. Adding a [reaction](https://github.blog/2016-03-10-add-reactions-to-pull-requests-issues-and-comments/) can also help be indicating to our maintainers that a particular problem is affecting more than just the reporter.

When creating a new issue, please do your best to be as detailed and specific as possible.

View: [Issues](https://github.com/dcgtc/dgrants/issues)

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


## App Contribution Guidelines

This section details the app architecture, conventions, and best practices.
Please read this section before making contributions within the `app` directory.

### Overview

Please start by reading [`app/README.md`](app//README.md) for a high-level overview of the app and how to get started developing with it.

### Composition API

The app is written with the Vue 3 Composition API because it's much better at keeping code organized (especially for larger codebases), and because it provides better TypeScript support.
All pages and components should be written using the Composition API, and not the standard Options API.
If you are unfamiliar with the Composition API, you can read more about it [here](https://v3.vuejs.org/guide/composition-api-introduction.html#why-composition-api).

Check out [`GrantRegistryNewGrant.vue`](app/src/views/GrantRegistryNewGrant.vue) for an example of a component that uses the Composition API.
In the Composition API docs referenced earlier, most examples put everything within the `setup()` method.
This is ok, but typically should only be done for simple components. For more complex components, logic and variables should be moved in composition functions, like the `useNewGrant()` method defined in `GrantRegistryNewGrant.vue`.

### State Management

This app uses its own state management pattern based on the Composition API, largely based on the pattern detailed in [this article](https://vueschool.io/articles/vuejs-tutorials/state-management-with-composition-api/).
The comments in [`wallet.ts`](app/src/store/wallet.ts) also provide details on this store pattern.

As a general rule of thumb, whenever you need to read or fetch more data from somewhere, it should be done in:
- `wallet.ts` for anything related to the user's wallet, e.g. token balances or ENS name
- `data.ts` for generic data fetching, such as reading a list of grant data from the `GrantRegistry` contract
- `cart.ts` for anything related to a user's cart and the checkout process
- `settings.ts` for user settings, which are saved in the browser's local storage

If you are writing a component or page that derives something from data that's already in a store, use a computed property and export the data from the store.
See the `userDisplayName` example in `wallet.ts` as an example.
That computed property is inlined since it's simple, but more complex computed properties can be extracted like `cartSummary` in `cart.ts`. If your computed property needs to be async, use a watcher instead.

Not every state variable, method, and computed property needs to be exported from the store module.
Only export aspects that are needed in other components or pages to keep interfaces and intentions clean and clear.

Do not export state variables directly from the store, as this is almost never required.
This is because in general state should not be mutated directly, but instead should only be mutated through a method exported from the store. In `cart.ts` we directly export the `cart` variable for simplicity when a user is editing their cart. However, a cleaner way might be to create a local copy of `cart` when `Cart.vue` mounts, and have `Cart.vue` call `updateCart` whenever the user edits their cart.

### Other Notes

- Comments are good! Please add lots of comments to your code so intentions are clear to all contributors.

- When using props, be explicit about the prop type. For example, don't use `Array` as a prop type. Instead use `Array as PropType<GrantsRoundDetails[]>`. Also make sure to specify if the prop is required, and if not, specify the default value. See `GrantDetailsRow.vue` for an example of well-declared props.

- Keep things DRY. If you implement something twice, pull out the logic into a shared method or as a helper method in `app/src/utils/*.ts`.

- Whenever imported something from ethers.js, instead of importing it directly from the package, import it from `app/src/utils/ethers.ts`, (and add more exports to that file if needed). This is done to prevent components having 5-10 lines of ethers imports when used heavily in a file, while still allowing for tree-shaking during build.

- For files with a lot of imports, keep the imports organized. Add some comments if it helps, as done in `Cart.vue`.

- All `*.vue` files in the `app/src/views` folder are pages. A page **must** have it's own route defined in `app/src/router/index.ts`, otherwise it's not a page and should instead be in the `app/src/components` folder.

- Vite does not use `process.env.MY_VARIABLE` for environment variables, but instead uses `import.meta.env.VITE_MY_VARIABLE`. Values in `.env` that are prefixed with `VITE_` are automatically included. Update the type definitions in `src/shims.d.ts` for any new environment variable

- Blocknative's [onboard.js](https://docs.blocknative.com/onboard) is used for connecting wallets. Like Vue 3, Vite does not automatically polyfill defaults like `os`, `http`, and `crypto` that are needed by onboard.js, so we `require` these as needed in `vite.config.ts` or `index.html`

## Getting Help

Join us in the [#decentralize-gitcoin](https://discord.gg/PtBTBM6D) channel on discord and post your question / suggestions / to see the progress the community is making on building the repo
