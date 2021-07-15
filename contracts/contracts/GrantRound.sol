pragma solidity ^0.8.5;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./GrantRegistry.sol";

contract GrantRound {
  using SafeERC20 for IERC20;
  // @notice Unix timestamp of the start of the round
  uint256 public startTime;
  // @notice Unix timestamp of the end of the round
  uint256 public endTime;
  // @notice Contract owner
  address public owner;
  // @notice GrantsRegistry
  address public registry;
  // @notice ERC20 token that accepts pool donations
  IERC20 public donationToken;
  // @notice URL pointing to grant round metadata (for off-chain use)
  string public metaPtr;
  // @notice minimum contribution amt that can be made
  uint256 public minContribution;
  // @notice Set to true if grant round has ended and payouts have been released
  bool public hasPaidOut;

  /// @notice Emitted when a grant receives a donation
  event DonationSent(uint96 indexed id, address indexed token, uint256 amount, address dest, address indexed donor);

  modifier onlyOwner() {
    require(msg.sender == owner, "Only owner can call this method");
    _;
  }

  modifier beforeRoundEnd() {
    require(block.timestamp < endTime, "Time has passed to complete this tx");
    _;
  }

  modifier activeRound() {
    require(block.timestamp >= startTime && block.timestamp < endTime, "Donations must be sent during an active round");
    _;
  }

  modifier roundEnd() {
    require(block.timestamp >= endTime, "Method must be called after the active round has ended");
    _;
  }

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
    address _registry,
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
  function acceptMatchingPool(uint256 _amount) external beforeRoundEnd {
    _safeTransferDonationToken(msg.sender, address(this), _amount);
  }

  /**
   * @notice During an active round users can use this method to send donation tokens to a specified grant
   * @param _donationAmount The number of tokens to be sent to grant receipient
   * @param _grantId The id of the grant in the registry
   */
  function donateToGrant(uint256 _donationAmount, uint96 _grantId) external activeRound {
    require(_donationAmount >= minContribution, "Donation amount must be greater than minimum contribution");

    GrantRegistry gRegistry = GrantRegistry(registry);
    require(gRegistry.isGrantInRegistry(_grantId), "Grant with given id does not exist in registry provided");

    address payee = gRegistry.getGrantPayee(_grantId);
    require(payee != address(0), "Payee not set in the grant metadata");
    donationToken.transfer(payee, _donationAmount);

    emit DonationSent(_grantId, address(donationToken), _donationAmount, payee, msg.sender);
  }

  /**
   * @notice When the round ends the owner can send the remaining matching pool funds to a given address
   * @param _payoutAddress An address to receive the remaining matching pool funds in the contract
   */
  function payoutGrant(address _payoutAddress) external roundEnd onlyOwner {
    uint256 balance = donationToken.balanceOf(address(this));
    donationToken.safeTransferFrom(address(this), _payoutAddress, balance);

    hasPaidOut = true;
  }

  // For testing purposes only
  function checkBalance(address addr) public view returns (uint256) {
    uint256 balance = donationToken.balanceOf(addr);
    return balance;
  }

  /**
   * @notice Helper function that wraps safeTransferFrom for the ERC20 donation token
   * @param _from Address that sends to tokens to a particular address
   * @param _to Address that receives the donation token
   * @param _amount The amount of donation token to be sent to a given address
   */
  function _safeTransferDonationToken(
    address _from,
    address _to,
    uint256 _amount
  ) internal {
    donationToken.safeTransferFrom(_from, _to, _amount);
  }
}
