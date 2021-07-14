pragma solidity ^0.8.5;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./GrantRegistry.sol";

contract GrantRound {
  using SafeERC20 for IERC20;
  // Unix timestamp of the start of the round
  uint256 startTime;
  // Unix timestamp of the end of the round
  uint256 endTime;
  // Contract owner
  address owner;
  // GrantsRegistry
  address registry;
  // ERC20 token that accepts pool donations
  address donationToken;
  // URL pointing to grant metadata (for off-chain use)
  string metaPtr;
  // minimum contribution amt that can be made
  uint256 minContribution;
  // Set to true if grant round has ended and payouts have been released
  bool hasPaidOut;

  /// @notice Emitted when a grant receives a donation
  event GrantDonation(uint96 indexed id, address indexed payee, uint256 donationAmount);

  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  modifier beforeRoundEnd() {
    require(block.timestamp < endTime);
    _;
  }

  modifier activeRound() {
    require(block.timestamp >= startTime && block.timestamp < endTime);
    _;
  }

  modifier roundEnd() {
    require(block.timestamp >= endTime);
    _;
  }

  constructor(
    address _owner,
    address _registry,
    address _donationToken,
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

  function acceptMatchingPool(uint256 donationAmount) external beforeRoundEnd {
    _safeTransferDonationToken(donationAmount);
  }

  function donateToGrant(uint256 donationAmount, uint96 grantId) external activeRound {
    require(donationAmount >= minContribution, "Donation amount must be greater than minimum contribution");

    GrantRegistry gRegistry = GrantRegistry(registry);

    require(gRegistry.isGrantInRegistry(grantId), "Grant with given id does not exist in registry provided");

    _safeTransferDonationToken(donationAmount);

    address payee = gRegistry.getGrantPayee(grantId);

    IERC20 token = IERC20(donationToken);
    token.safeTransfer(payee, donationAmount);

    emit GrantDonation(grantId, payee, donationAmount);
  }

  function payoutGrant(address payoutAddress) external roundEnd onlyOwner {
    IERC20 token = IERC20(donationToken);
    uint256 balance = token.balanceOf(address(this));
    token.safeTransfer(payoutAddress, balance);

    hasPaidOut = true;
  }

  function _safeTransferDonationToken(uint256 amount) internal {
    IERC20 token = IERC20(donationToken);
    token.safeTransferFrom(msg.sender, address(this), amount);
  }
}
