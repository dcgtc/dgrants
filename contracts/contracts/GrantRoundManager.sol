// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.5;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "solidity-bytes-utils/contracts/BytesLib.sol";
import "./GrantRegistry.sol";
import "./GrantRound.sol";

contract GrantRoundManager {
  using Address for address;
  using BytesLib for bytes;
  using SafeERC20 for IERC20;

  /// @notice Donation inputs and Uniswap V3 swap inputs: https://docs.uniswap.org/protocol/guides/swaps/multihop-swaps
  struct Donation {
    uint96 grantId; // grant ID to which donation is being made
    GrantRound[] rounds; // rounds against which the donation should be counted
    bytes path; // swap path, or if user is providing donationToken, the address of the donationToken
    uint256 deadline; // unix timestamp after which a swap will revert, i.e. swap must be executed before this
    uint256 amountIn; // amount donated by the user
    uint256 amountOutMinimum; // minimum amount to be returned after swap
  }

  /// @notice Address of the GrantRegistry
  GrantRegistry public immutable registry;

  /// @notice Address of the Uniswap V3 Router used for token swaps
  ISwapRouter public immutable router;

  /// @notice Address of the ERC20 token in which donations are made
  IERC20 public immutable donationToken;

  /// @notice WETH address
  address public constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;

  /// @notice Emitted when a new GrantRound contract is created
  event GrantRoundCreated(address grantRound);

  /// @notice Emitted when a donation has been made
  event GrantDonation(
    uint96 indexed grantId,
    IERC20 indexed tokenIn,
    uint256 amountIn,
    uint256 amountOut,
    GrantRound[] rounds
  );

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
   * @notice Swap and donate to a grant
   * @param  _donation Donation being made to a grant
   */
  function swapAndDonate(Donation calldata _donation) external payable {
    // --- Validation ---
    // Rounds must be specified
    GrantRound[] calldata _rounds = _donation.rounds;
    require(_rounds.length > 0, "GrantRoundManager: Must specify at least one round");

    // Only allow value to be sent if the input token is WETH (this limitation should be fixed in #76, as this
    // require statement prohibits donating WETH)
    IERC20 _tokenIn = IERC20(_donation.path.toAddress(0));
    require(
      (msg.value == 0 && address(_tokenIn) != WETH) || (msg.value > 0 && address(_tokenIn) == WETH),
      "GrantRoundManager: Invalid token-value pairing"
    );

    // Ensure grant recieving donation exists in registry
    uint96 _grantId = _donation.grantId;
    require(_grantId < registry.grantCount(), "GrantRoundManager: Grant does not exist in registry");

    // Iterate through each GrantRound to verify:
    //   - The round has the same donationToken as the GrantRoundManager
    //   - The round is active
    for (uint256 i = 0; i < _rounds.length; i++) {
      require(_rounds[i].isActive(), "GrantRoundManager: GrantRound is not active");
      require(
        donationToken == _rounds[i].donationToken(),
        "GrantRoundManager: GrantRound's donation token does not match GrantRoundManager's donation token"
      );
    }

    // --- Swap ---
    address _payoutAddress = registry.getGrantPayee(_grantId);
    uint256 _amountIn = _donation.amountIn;
    uint256 _amountOut = _amountIn; // by default, by may be overwritten in the swap branch below

    if (_tokenIn == donationToken && msg.value == 0) {
      // ETH as the donation token is not supported, so ensure msg.value is zero
      _tokenIn.safeTransferFrom(msg.sender, _payoutAddress, _amountOut); // transfer funds directly to payout address
    } else {
      // Swap setup
      ISwapRouter.ExactInputParams memory params = ISwapRouter.ExactInputParams(
        _donation.path,
        _payoutAddress, // recipient
        _donation.deadline,
        _amountIn,
        _donation.amountOutMinimum
      );

      // If user is sending a token, transfer it to this contract and approve the router to spend it
      if (msg.value == 0) {
        _tokenIn.safeTransferFrom(msg.sender, address(this), _amountIn);
        _tokenIn.approve(address(router), type(uint256).max); // TODO optimize so we don't call this every time
      }

      // Execute swap -- output of swap is sent to the payoutAddress
      _amountOut = router.exactInput{value: msg.value}(params);
    }

    emit GrantDonation(_grantId, _tokenIn, _amountIn, _amountOut, _rounds);
  }
}
