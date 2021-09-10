## 0.0.1 (2021-09-10)

### Bug Fixes

- button in TransactionStatus component now works ([232adbb](https://github.com/dcgtc/dgrants/commit/232adbb0381440843e4e31c3df4294b8214c84d6))
- cart checkout now handles ETH vs WETH properly ([3be655a](https://github.com/dcgtc/dgrants/commit/3be655a7f728a14a7f65209d60db28a58588bc3e))
- cart now properly handles decimal amounts ([7e887f3](https://github.com/dcgtc/dgrants/commit/7e887f32b5fc6c3bff125c683d98c459f04f554d))
- clearing cart and removing items syncs Cart.vue state with localstorage ([44c0f55](https://github.com/dcgtc/dgrants/commit/44c0f559d0a639e29d972c7b6a73821d22e54948))
- handle cases when integer division flooring results in donation sums < 100% ([a61ad8f](https://github.com/dcgtc/dgrants/commit/a61ad8fe0fab071fa211fa6a1feb0721d6ff93bf))
- remove duplicate function definition that resulted from rebase ([4798a1a](https://github.com/dcgtc/dgrants/commit/4798a1a360156005d6f3cf35e23b56ab0dd97666))

### Features

- add BaseSelect to choose token, sync cart with localStorage ([cbdddfe](https://github.com/dcgtc/dgrants/commit/cbdddfea17482d8965b2242f413386d4dc370c56))
- add global error handler so all errors are surfaced to user ([5f4e4b8](https://github.com/dcgtc/dgrants/commit/5f4e4b8e67e6ece6e7cf24cb3385d455e00c29a6))
- add GrantRoundPage + add metadata ([556da69](https://github.com/dcgtc/dgrants/commit/556da69b8cbb19ff689d0445aa78271856bb4d8a))
- add notify.js for showing notifications ([f51c906](https://github.com/dcgtc/dgrants/commit/f51c906cc7e215a0d833a9a7d884647458d292f4))
- add summary string, add alerts for not-implemented features ([f804a08](https://github.com/dcgtc/dgrants/commit/f804a08a303531b92d0ececa59375a7f6c48049c))
- add TransactionStatus component and use it for cart ([b3eb05d](https://github.com/dcgtc/dgrants/commit/b3eb05d695b8e6aa1958fcc8898517073a20bcfe))
- assert user has sufficient balance before executing checkout ([3104a9c](https://github.com/dcgtc/dgrants/commit/3104a9c968151d150e3c3c55d45881a1d10ff699))
- calculate amountOutMin to minimize slippage ([eec37d3](https://github.com/dcgtc/dgrants/commit/eec37d346e9a6e213b72cd7dc40818db7b468c3d))
- cart UX improvements ([84adc27](https://github.com/dcgtc/dgrants/commit/84adc27ebd5ff937e0b789e53f7dafe7fd6bd07f))
- integrate trust-bonus ([357cb08](https://github.com/dcgtc/dgrants/commit/357cb08949163db268651a31080703ecda6d0eaa))
- load grants into grantRound page ([afeab04](https://github.com/dcgtc/dgrants/commit/afeab042d4c1c152b3e19a9d26ed8c16b35f833b))
- setup cart page ([3bdc878](https://github.com/dcgtc/dgrants/commit/3bdc8783461a1f63318a5efc8a2d7b1be120c54e))
- setup list of items in cart on cart page ([279e1d4](https://github.com/dcgtc/dgrants/commit/279e1d482fec58c73e417f18fed84630ee7e28c8))
- show grant name on the cart page ([49b6533](https://github.com/dcgtc/dgrants/commit/49b65332a86b1d485dc23af7f99ad0679cbbde0d))
- successful checkouts for all supported tokens ([4e0677b](https://github.com/dcgtc/dgrants/commit/4e0677bc7c57fe812d8e37ce942210003ec3a6b2))
- support adding grants to cart by saving them to localStorage ([4f463b2](https://github.com/dcgtc/dgrants/commit/4f463b2780bc282573b0209d0499b5c6e2ad8467))
