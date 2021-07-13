pragma solidity ^0.8.5;

contract GrantRound {
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

  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  constructor(
    address _owner,
    address _registry,
    address _donationToken
  ) {}
}
