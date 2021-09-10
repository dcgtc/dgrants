## 0.0.1 (2021-09-10)


### Bug Fixes

* button in TransactionStatus component now works ([232adbb](https://github.com/dcgtc/dgrants/commit/232adbb0381440843e4e31c3df4294b8214c84d6))
* cart checkout now handles ETH vs WETH properly ([3be655a](https://github.com/dcgtc/dgrants/commit/3be655a7f728a14a7f65209d60db28a58588bc3e))
* cart now properly handles decimal amounts ([7e887f3](https://github.com/dcgtc/dgrants/commit/7e887f32b5fc6c3bff125c683d98c459f04f554d))
* clearing cart and removing items syncs Cart.vue state with localstorage ([44c0f55](https://github.com/dcgtc/dgrants/commit/44c0f559d0a639e29d972c7b6a73821d22e54948))
* donate and swap tests now pass with GrantRoundManager update ([ac5b1ea](https://github.com/dcgtc/dgrants/commit/ac5b1eab11d055c88e31121fe45d4e1896e0773f))
* handle cases when integer division flooring results in donation sums < 100% ([a61ad8f](https://github.com/dcgtc/dgrants/commit/a61ad8fe0fab071fa211fa6a1feb0721d6ff93bf))
* remove duplicate function definition that resulted from rebase ([4798a1a](https://github.com/dcgtc/dgrants/commit/4798a1a360156005d6f3cf35e23b56ab0dd97666))
* support London ([a7b6a00](https://github.com/dcgtc/dgrants/commit/a7b6a00094ac87d20ac0b745eac72ae78058020a))
* uniswap route encoding for tests ([765e9aa](https://github.com/dcgtc/dgrants/commit/765e9aa5343b5bc6eee8fd264c1eb3fc150cad79))


### Features

* add BaseSelect to choose token, sync cart with localStorage ([cbdddfe](https://github.com/dcgtc/dgrants/commit/cbdddfea17482d8965b2242f413386d4dc370c56))
* add global error handler so all errors are surfaced to user ([5f4e4b8](https://github.com/dcgtc/dgrants/commit/5f4e4b8e67e6ece6e7cf24cb3385d455e00c29a6))
* add GrantRoundPage + add metadata ([556da69](https://github.com/dcgtc/dgrants/commit/556da69b8cbb19ff689d0445aa78271856bb4d8a))
* add GrantRoundPayout contract ([93294a3](https://github.com/dcgtc/dgrants/commit/93294a3d2878bedc3bfb36693a0520f4204ee9ed))
* add linear + sha handle function ([3d60280](https://github.com/dcgtc/dgrants/commit/3d6028047289b94484b76549a7344bbd80823809))
* add notify.js for showing notifications ([f51c906](https://github.com/dcgtc/dgrants/commit/f51c906cc7e215a0d833a9a7d884647458d292f4))
* add summary string, add alerts for not-implemented features ([f804a08](https://github.com/dcgtc/dgrants/commit/f804a08a303531b92d0ececa59375a7f6c48049c))
* add support for batch donations to GrantRoundManager ([095f1ee](https://github.com/dcgtc/dgrants/commit/095f1ee94186239a7dde71f4b1aa68208b651474))
* add swapAndDonate to GrantRoundManager ([68ed43b](https://github.com/dcgtc/dgrants/commit/68ed43bab8b7ffbe84c79115307eee7d45dbe5df))
* add TransactionStatus component and use it for cart ([b3eb05d](https://github.com/dcgtc/dgrants/commit/b3eb05d695b8e6aa1958fcc8898517073a20bcfe))
* add utils package ([f102a99](https://github.com/dcgtc/dgrants/commit/f102a99dd8678d860ce032841f3f2bb0496b83d1))
* assert user has sufficient balance before executing checkout ([3104a9c](https://github.com/dcgtc/dgrants/commit/3104a9c968151d150e3c3c55d45881a1d10ff699))
* calculate amountOutMin to minimize slippage ([eec37d3](https://github.com/dcgtc/dgrants/commit/eec37d346e9a6e213b72cd7dc40818db7b468c3d))
* cart UX improvements ([84adc27](https://github.com/dcgtc/dgrants/commit/84adc27ebd5ff937e0b789e53f7dafe7fd6bd07f))
* implement calculate & predict ([0b96dba](https://github.com/dcgtc/dgrants/commit/0b96dbaea8cc18a982f10a7c938816c12d1a3734))
* integrate trust-bonus ([357cb08](https://github.com/dcgtc/dgrants/commit/357cb08949163db268651a31080703ecda6d0eaa))
* load grants into grantRound page ([afeab04](https://github.com/dcgtc/dgrants/commit/afeab042d4c1c152b3e19a9d26ed8c16b35f833b))
* removes shar256 and adds merkle-distributor ([52dcf7e](https://github.com/dcgtc/dgrants/commit/52dcf7efd3bce9d17049f1abce75969b615e2aa5))
* setup cart page ([3bdc878](https://github.com/dcgtc/dgrants/commit/3bdc8783461a1f63318a5efc8a2d7b1be120c54e))
* setup list of items in cart on cart page ([279e1d4](https://github.com/dcgtc/dgrants/commit/279e1d482fec58c73e417f18fed84630ee7e28c8))
* show grant name on the cart page ([49b6533](https://github.com/dcgtc/dgrants/commit/49b65332a86b1d485dc23af7f99ad0679cbbde0d))
* successful checkouts for all supported tokens ([4e0677b](https://github.com/dcgtc/dgrants/commit/4e0677bc7c57fe812d8e37ce942210003ec3a6b2))
* support adding grants to cart by saving them to localStorage ([4f463b2](https://github.com/dcgtc/dgrants/commit/4f463b2780bc282573b0209d0499b5c6e2ad8467))
* update claim to support multiple claims ([5e50770](https://github.com/dcgtc/dgrants/commit/5e507701fbe4671a2b3fec2b6f0912470cc60b1d))



