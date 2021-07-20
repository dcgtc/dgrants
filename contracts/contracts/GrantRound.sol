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

  /// @notice Contract owner
  address public owner;

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

  // --- Core methods ---

  /**
   * @notice Instantiates a new grant round
   * @param _owner Grant round owner that has permission to payout the matching pool
   * @param _registry Address that contains the grant metadata
   * @param _donationToken Address of the ERC20 token in which donations are made
   * @param _startTime Unix timestamp of the start of the round
   * @param _endTime Unix timestamp of the end of the round
   * @param _metaPtr URL pointing to the grant round metadata
   * @param _minContribution Miniumum donation amount that can be made using the given donation token
   */
  constructor(
    address _owner,
    GrantRegistry _registry,
    IERC20 _donationToken,
    uint256 _startTime,
    uint256 _endTime,
    string memory _metaPtr,
    uint256 _minContribution
  ) {
    hasPaidOut = false;
    owner = _owner;
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
   * @notice During an active round users can use this method to send donation tokens to a specified grant
   * @param _donationAmount The number of tokens to be sent to grant receipient
   * @param _grantId The id of the grant in the registry
   */
  function donateToGrant(uint256 _donationAmount, uint96 _grantId) external activeRound {
    require(
      _donationAmount >= minContribution,
      "GrantRound: Donation amount must be greater than minimum contribution"
    );

    require(_grantId < registry.grantCount(), "GrantRound: Grant with given id does not exist in registry provided");

    address payee = registry.getGrantPayee(_grantId);
    require(payee != address(0), "GrantRound: Payee not set in the grant metadata");
    donationToken.safeTransferFrom(msg.sender, payee, _donationAmount);

    emit DonationSent(_grantId, address(donationToken), _donationAmount, msg.sender);
  }

  /**
   * @notice When the round ends the owner can send the remaining matching pool funds to a given address
   * @param _payoutAddress An address to receive the remaining matching pool funds in the contract
   */
  function payoutGrants(address _payoutAddress) external afterRoundEnd onlyOwner {
    uint256 balance = donationToken.balanceOf(address(this));
    hasPaidOut = true;
    donationToken.safeTransfer(_payoutAddress, balance);
  }

  // --- Modifiers ---

  modifier onlyOwner() {
    require(msg.sender == owner, "Only owner can call this method");
    _;
  }

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
    require(block.timestamp >= endTime, "GrantRound: Method must be called after the active round has ended");
    _;
  }
}
