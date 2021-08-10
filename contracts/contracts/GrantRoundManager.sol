// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.5;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "solidity-bytes-utils/contracts/BytesLib.sol";
import "./GrantRegistry.sol";
import "./GrantRound.sol";

contract GrantRoundManager {
  // --- Libraries ---
  using Address for address;
  using BytesLib for bytes;
  using SafeERC20 for IERC20;

  // --- Data ---
  /// @notice Address of the GrantRegistry
  GrantRegistry public immutable registry;

  /// @notice Address of the Uniswap V3 Router used for token swaps
  ISwapRouter public immutable router;

  /// @notice Address of the ERC20 token in which donations are made
  IERC20 public immutable donationToken;

  /// @notice Used during donations to temporarily store swap output amounts
  mapping(IERC20 => uint256) internal swapOutputs;

  /// @notice WETH address
  address public constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;

  /// @notice Scale factor
  uint256 internal constant WAD = 1e18;

  /// @notice Defines the total `amount` of the specified `token` that needs to be swapped to `donationToken`. If
  /// `path == donationToken`, no swap is required and we just transfer the tokens
  struct SwapSummary {
    address token;
    uint256 amount;
    uint256 amountOutMinimum; // minimum amount to be returned after swap
    bytes path;
  }

  /// @notice Donation inputs and Uniswap V3 swap inputs: https://docs.uniswap.org/protocol/guides/swaps/multihop-swaps
  struct Donation {
    uint96 grantId; // grant ID to which donation is being made
    IERC20 token; // address of the token to donate
    uint256 ratio; // ratio of `token` to donate, specified as numerator where WAD = 1e18 = 100%
    GrantRound[] rounds; // rounds against which the donation should be counted
  }

  // --- Events ---
  /// @notice Emitted when a new GrantRound contract is created
  event GrantRoundCreated(address grantRound);

  /// @notice Emitted when a donation has been made
  event GrantDonation(uint96 indexed grantId, IERC20 indexed tokenIn, uint256 donationAmount, GrantRound[] rounds);

  // --- Constructor ---
  constructor(
    GrantRegistry _registry,
    ISwapRouter _router,
    IERC20 _donationToken
  ) {
    require(_registry.grantCount() >= 0, "GrantRoundManager: Invalid registry");
    require(address(_router).isContract(), "GrantRoundManager: Invalid router"); // Router interface doesn't have a state variable to check
    require(_donationToken.totalSupply() > 0, "GrantRoundManager: Invalid token");

    registry = _registry;
    router = _router;
    donationToken = _donationToken;
  }

  // --- Core methods ---

  /**
   * @notice Creates a new GrantRound
   * @param _owner Grant round owner that has permission to update the metadata pointer
   * @param _payoutAdmin Grant round administrator that has permission to payout the matching pool
   * @param _matchingToken Address for the token used to payout match amounts at the end of a round
   * @param _registry Address that contains the grant metadata
   * @param _startTime Unix timestamp of the start of the round
   * @param _endTime Unix timestamp of the end of the round
   * @param _metaPtr URL pointing to the grant round metadata
   * @param _minContribution Miniumum donation amount that can be made using the given donation token
   */
  function createGrantRound(
    address _owner,
    address _payoutAdmin,
    IERC20 _matchingToken,
    GrantRegistry _registry,
    uint256 _startTime,
    uint256 _endTime,
    string memory _metaPtr,
    uint256 _minContribution
  ) external {
    require(_matchingToken.totalSupply() > 0, "GrantRoundManager: Invalid matching token");
    GrantRound _grantRound = new GrantRound(
      _owner,
      _payoutAdmin,
      _registry,
      donationToken,
      _matchingToken,
      _startTime,
      _endTime,
      _metaPtr,
      _minContribution
    );

    emit GrantRoundCreated(address(_grantRound));
  }

  /**
   * @notice Performs swaps if necessary and donates funds as specified
   * @param _swaps Array of SwapSummary objects describing the swaps required
   * @param _deadline Unix timestamp after which a swap will revert, i.e. swap must be executed before this
   * @param _donations Array of donations to execute
   * @dev `_deadline` is not part of the `_swaps` array since all swaps can use the same `_deadline` to save some gas
   * @dev Caller must ensure the input tokens to the _swaps array are unique
   * @dev Does not verify
   */
  function donate(
    SwapSummary[] calldata _swaps,
    uint256 _deadline,
    Donation[] calldata _donations
  ) external payable {
    // --- Validation ---
    // TODO consider moving this to the section where we already loop through donations in case that saves a lot of
    // gas. Leaving it here for now to improve readability
    for (uint256 i = 0; i < _donations.length; i++) {
      require(_donations[i].grantId < registry.grantCount(), "GrantRoundManager: Grant does not exist in registry");

      GrantRound[] calldata _rounds = _donations[i].rounds;
      require(_rounds.length > 0, "GrantRoundManager: Must specify at least one round");
      for (uint256 j = 0; j < _rounds.length; j++) {
        require(_rounds[j].isActive(), "GrantRoundManager: GrantRound is not active");
        require(
          donationToken == _rounds[j].donationToken(),
          "GrantRoundManager: GrantRound's donation token does not match GrantRoundManager's donation token"
        );
      }
    }

    // --- Execute all swaps ---
    for (uint256 i = 0; i < _swaps.length; i++) {
      // Do nothing if the swap input token equals donationToken
      IERC20 _tokenIn = IERC20(_swaps[i].path.toAddress(0));
      if (_tokenIn == donationToken) continue;

      // Otherwise, execute swap
      ISwapRouter.ExactInputParams memory params = ISwapRouter.ExactInputParams(
        _swaps[i].path,
        address(this), // send output to the contract and it will be transferred later
        _deadline,
        _swaps[i].amount,
        _swaps[i].amountOutMinimum
      );

      require(swapOutputs[_tokenIn] == 0, "GrantRoundManager: Swap parameter has duplicate input tokens");
      swapOutputs[_tokenIn] = router.exactInput{value: msg.value}(params); // save off output amount for later
    }

    // --- Execute donations ---
    for (uint256 i = 0; i < _donations.length; i++) {
      // Get data
      GrantRound[] calldata _rounds = _donations[i].rounds;
      uint96 _grantId = _donations[i].grantId;
      IERC20 _tokenIn = _donations[i].token;
      uint256 _donationAmount = (swapOutputs[_tokenIn] * _donations[i].ratio) / WAD;
      address _payee = registry.getGrantPayee(_grantId);

      // Execute transfer
      if (_tokenIn == donationToken) {
        _tokenIn.safeTransferFrom(msg.sender, _payee, _donationAmount); // transfer token directly from caller
      } else {
        donationToken.transfer(_payee, _donationAmount); // transfer swap output
      }
      emit GrantDonation(_grantId, _tokenIn, _donationAmount, _rounds);
    }

    // --- Clear storage ---
    for (uint256 i = 0; i < _swaps.length; i++) {
      IERC20 _tokenIn = IERC20(_swaps[i].path.toAddress(0));
      swapOutputs[_tokenIn] = 0; // storage refund
    }
  }
}
