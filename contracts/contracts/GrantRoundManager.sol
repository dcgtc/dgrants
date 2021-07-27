// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.5;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./GrantRound.sol";

contract GrantRoundManager {
  /// @notice Address of the ERC20 token in which donations are made
  IERC20 public immutable donationToken;

  /// @notice Emitted when a new GrantRound contract is created
  event GrantRoundCreated(address grantRound);

  constructor(IERC20 _donationToken) {
    require(_donationToken.totalSupply() > 0, "GrantRoundManager: Invalid token");
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
}
