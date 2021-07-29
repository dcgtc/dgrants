// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.5;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "./GrantRegistry.sol";
import "./GrantRound.sol";

contract GrantRoundManager {
  using Address for address;
  using SafeERC20 for IERC20;

  /// @notice Donation Object
  struct Donation {
    uint96 grantId; // grant ID to which donation is being made
    GrantRound[] rounds; // rounds against which the donation should be counted
    IERC20 tokenIn; // token in which the user made the donation
    uint24 fee; // selected fee tier
    uint256 deadline; // deadline by when swap has to be happen
    uint256 amountIn; // amount donated by the user
    uint256 amountOutMinimum; // minimum amount to be returned after swap
    uint160 sqrtPriceLimitX96; // determine limits on the pool prices which cannot exceed swap
  }

  /// @notice Address of the GrantRegistry
  GrantRegistry public immutable registry;

  /// @notice Address of the Uniswap V3 Router used for token swaps
  ISwapRouter public immutable router;

  /// @notice Address of the ERC20 token in which donations are made
  IERC20 public immutable donationToken;

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
   * @param _registry Address that contains the grant metadata
   * @param _startTime Unix timestamp of the start of the round
   * @param _endTime Unix timestamp of the end of the round
   * @param _metaPtr URL pointing to the grant round metadata
   * @param _minContribution Miniumum donation amount that can be made using the given donation token
   */
  function createGrantRound(
    address _owner,
    address _payoutAdmin,
    GrantRegistry _registry,
    uint256 _startTime,
    uint256 _endTime,
    string memory _metaPtr,
    uint256 _minContribution
  ) external {
    GrantRound _grantRound = new GrantRound(
      _owner,
      _payoutAdmin,
      _registry,
      donationToken,
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
  function swapAndDonate(Donation calldata _donation) external {
    uint96 grantId = _donation.grantId;
    GrantRound[] calldata rounds = _donation.rounds;

    // Checks to ensure grant recieving donation exists in registry
    require(grantId < registry.grantCount(), "GrantRoundManager: Grant does not exist in registry provided");

    /**
     * Iterates through every GrantRound to ensure it has the
     * - same donationToken as the GrantRoundManager
     * - GrantRound is active
     */
    for (uint256 i = 0; i <= rounds.length; i++) {
      require(
        donationToken == rounds[i].donationToken(),
        "GrantRoundManager: GrantRound's donation token does not match GrantRoundManager's donation token"
      );

      require(
        block.timestamp >= rounds[i].startTime() && block.timestamp < rounds[i].endTime(),
        "GrantRoundManager: GrantRound is not active"
      );
    }

    address payoutAddress = registry.getGrantPayee(grantId);
    IERC20 tokenIn = _donation.tokenIn;
    uint256 amountIn = _donation.amountIn;

    uint256 amountOut;
    if (tokenIn == donationToken) {
      // Transfer funds directly to grant payout address
      amountOut = amountIn;
      tokenIn.safeTransferFrom(msg.sender, payoutAddress, amountOut);
    } else {
      uint24 fee = _donation.fee;
      uint256 deadline = _donation.deadline;
      uint256 amountOutMinimum = _donation.amountOutMinimum;
      uint160 sqrtPriceLimitX96 = _donation.sqrtPriceLimitX96;

      // Prepare to swap the provided token to donationToken using Uniswap V3
      tokenIn.safeTransferFrom(msg.sender, address(this), amountIn);
      ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams(
        address(tokenIn), // tokenIn
        address(donationToken), // tokenOut
        fee, // fee
        payoutAddress, // recipient
        deadline, // deadline
        amountIn, // amountIn
        amountOutMinimum, // amountOutMinimum
        sqrtPriceLimitX96 // sqrtPriceLimitX96
      );

      // Execute swap -- output of swap is sent to the payoutAddress
      amountOut = router.exactInputSingle(params);
    }

    emit GrantDonation(grantId, tokenIn, amountIn, amountOut, rounds);
  }
}
