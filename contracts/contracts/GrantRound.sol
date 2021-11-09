// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.7.6;
pragma abicoder v2;

import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "./interfaces/IMetadataPointer.sol";
import "./GrantRegistry.sol";

contract GrantRound {
  using SafeERC20 for IERC20;

  // --- Data ---
  /// @notice Unix timestamp of the start of the round
  uint256 public immutable startTime;

  /// @notice Unix timestamp of the end of the round
  uint256 public immutable endTime;

  /// @notice Grant round payout administrator
  address public immutable payoutAdmin;

  /// @notice Grant round metadata administrator
  address public immutable metadataAdmin;

  /// @notice GrantsRegistry
  GrantRegistry public immutable registry;

  /// @notice Token used for all contributions. Contributions in a different token are swapped to this token
  IERC20 public immutable donationToken;

  /// @notice Token used to payout match amounts at the end of a round
  IERC20 public immutable matchingToken;

  /// @notice URL pointing to grant round metadata (for off-chain use)
  MetaPtr public metaPtr;

  /// @notice Set to true if grant round has ended and payouts have been released
  bool public hasPaidOut;

  // --- Events ---
  /// @notice Emitted when a grant round metadata pointer is updated
  event MetadataUpdated(MetaPtr oldMetaPtr, MetaPtr newMetaPtr);

  /// @notice Emitted when a contributor adds funds using the matching pool token
  event AddMatchingFunds(uint256 amount, address indexed contributor);

  /// @notice Emitted when the matching token is paid out
  event PaidOutGrants(uint256 amount);

  // --- Core methods ---
  /**
   * @notice Instantiates a new grant round
   * @param _metadataAdmin The address with the role that has permission to update the metadata pointer
   * @param _payoutAdmin Grant round administrator that has permission to payout the matching pool
   * @param _registry Address that contains the grant metadata
   * @param _donationToken Address of the ERC20 token in which donations are made
   * @param _matchingToken Address of the ERC20 token for accepting matching pool contributions
   * @param _startTime Unix timestamp of the start of the round
   * @param _endTime Unix timestamp of the end of the round
   * @param _metaPtr URL pointing to the grant round metadata
   */
  constructor(
    address _metadataAdmin,
    address _payoutAdmin,
    GrantRegistry _registry,
    IERC20 _donationToken,
    IERC20 _matchingToken,
    uint256 _startTime,
    uint256 _endTime,
    MetaPtr memory _metaPtr
  ) {
    require(_donationToken.totalSupply() > 0, "GrantRound: Invalid donation token");
    require(_matchingToken.totalSupply() > 0, "GrantRound: Invalid matching token");
    require(_startTime >= block.timestamp, "GrantRound: Start time has already passed");
    require(_endTime > _startTime, "GrantRound: End time must be after start time");

    metadataAdmin = _metadataAdmin;
    payoutAdmin = _payoutAdmin;
    hasPaidOut = false;
    registry = _registry;
    donationToken = _donationToken;
    matchingToken = _matchingToken;
    startTime = _startTime;
    endTime = _endTime;
    metaPtr = _metaPtr;
  }

  /**
   * @notice Before the round ends this method accepts matching pool funds
   * @param _amount The amount of matching token that will be sent to the contract for the matching pool
   */
  function addMatchingFunds(uint256 _amount) external {
    require(block.timestamp < endTime, "GrantRound: Method must be called before round has ended");
    matchingToken.safeTransferFrom(msg.sender, address(this), _amount);
    emit AddMatchingFunds(_amount, msg.sender);
  }

  /**
   * @notice When the round ends the payoutAdmin can send the remaining matching pool funds to a given address
   * @param _payoutAddress An address to receive the remaining matching pool funds in the contract
   */
  function payoutGrants(address _payoutAddress) external {
    require(block.timestamp >= endTime, "GrantRound: Method must be called after round has ended");
    require(msg.sender == payoutAdmin, "GrantRound: Only the payout administrator can call this method");
    uint256 balance = matchingToken.balanceOf(address(this));
    hasPaidOut = true;
    matchingToken.safeTransfer(_payoutAddress, balance);
    emit PaidOutGrants(balance);
  }

  /**
   * @notice Updates the metadata pointer to a new location
   * @param _newMetaPtr A string where the updated metadata is stored
   */
  function updateMetadataPtr(MetaPtr calldata _newMetaPtr) external {
    require(msg.sender == metadataAdmin, "GrantRound: Action can be performed only by metadataAdmin");
    emit MetadataUpdated(metaPtr, _newMetaPtr);
    metaPtr = _newMetaPtr;
  }

  /**
   * @notice Returns true if the round is active, false otherwise
   */
  function isActive() public view returns (bool) {
    return block.timestamp >= startTime && block.timestamp < endTime;
  }
}
