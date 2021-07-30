// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.6;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
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

  /// @notice ERC20 token that accepts pool donations
  IERC20 public immutable donationToken;

  /// @notice URL pointing to grant round metadata (for off-chain use)
  string public metaPtr;

  /// @notice minimum contribution amount that can be made
  uint256 public immutable minContribution;

  /// @notice Set to true if grant round has ended and payouts have been released
  bool public hasPaidOut;

  // --- Events ---

  /// @notice Emitted when a grant receives a donation
  event DonationSent(uint96 indexed id, address indexed token, uint256 amount, address indexed donor);

  /// @notice Emitted when a grant round metadata pointer is updated
  event MetadataUpdated(string oldMetaPtr, string indexed newMetaPtr);

  // --- Core methods ---

  /**
   * @notice Instantiates a new grant round
   * @param _metadataAdmin The address with the role that has permission to update the metadata pointer
   * @param _payoutAdmin Grant round administrator that has permission to payout the matching pool
   * @param _registry Address that contains the grant metadata
   * @param _donationToken Address of the ERC20 token in which donations are made
   * @param _startTime Unix timestamp of the start of the round
   * @param _endTime Unix timestamp of the end of the round
   * @param _metaPtr URL pointing to the grant round metadata
   * @param _minContribution Miniumum donation amount that can be made using the given donation token
   */
  constructor(
    address _metadataAdmin,
    address _payoutAdmin,
    GrantRegistry _registry,
    IERC20 _donationToken,
    uint256 _startTime,
    uint256 _endTime,
    string memory _metaPtr,
    uint256 _minContribution
  ) {
    require(_donationToken.totalSupply() > 0, "GrantRound: Invalid token");
    require(_startTime >= block.timestamp, "GrantRound: Start time has already passed");
    require(_endTime > _startTime, "GrantRound: End time must be after start time");
    require(_registry.grantCount() >= 0, "GrantRound: Invalid registry"); // verify this call doesn't revert

    metadataAdmin = _metadataAdmin;
    payoutAdmin = _payoutAdmin;
    hasPaidOut = false;
    registry = _registry;
    donationToken = _donationToken;
    startTime = _startTime;
    endTime = _endTime;
    metaPtr = _metaPtr;
    minContribution = _minContribution;
  }

  /**
   * @notice Before the round ends this method accepts matching pool funds
   * @param _amount The amount of donation token that can be sent to the contract for the matching pool
   */
  function addMatchingFunds(uint256 _amount) external beforeRoundEnd {
    donationToken.safeTransferFrom(msg.sender, address(this), _amount);
  }

  /**
   * @notice When the round ends the payoutAdmin can send the remaining matching pool funds to a given address
   * @param _payoutAddress An address to receive the remaining matching pool funds in the contract
   */
  function payoutGrants(address _payoutAddress) external afterRoundEnd {
    require(msg.sender == payoutAdmin, "GrantRound: Only the payout administrator can call this method");
    uint256 balance = donationToken.balanceOf(address(this));
    hasPaidOut = true;
    donationToken.safeTransfer(_payoutAddress, balance);
  }

  /**
   * @notice Updates the metadata pointer to a new location
   * @param _newMetaPtr A string where the updated metadata is stored
   */
  function updateMetadataPtr(string memory _newMetaPtr) external {
    require(msg.sender == metadataAdmin, "GrantRound: Action can be perfomed only by metadataAdmin");
    string memory oldPtr = metaPtr;
    metaPtr = _newMetaPtr;

    emit MetadataUpdated(oldPtr, _newMetaPtr);
  }

  // --- Modifiers ---

  modifier beforeRoundEnd() {
    require(block.timestamp < endTime, "GrantRound: Action cannot be performed as the round has ended");
    _;
  }

  modifier activeRound() {
    require(
      block.timestamp >= startTime && block.timestamp < endTime,
      "GrantRound: Donations must be sent during an active round"
    );
    _;
  }

  modifier afterRoundEnd() {
    require(block.timestamp >= endTime, "GrantRound: Method must be called after round has ended");
    _;
  }
}
