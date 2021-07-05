pragma solidity ^0.8.5;

contract GrantRounds {
  // Grant Round ID - The hash of the grant round metadata
  bytes32 public grantRoundsId;
  // Metadata Pointer
  string public metaPtr;

  // Owner
  address owner;

  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  constructor(
    address _owner,
    bytes32 _grantRoundsId,
    string memory _metaPtr
  ) {
    owner = _owner;
    grantRoundsId = _grantRoundsId;
    metaPtr = _metaPtr;
  }

  // State
  enum State {
    CONFIG,
    ACTIVE,
    CLAIM,
    CLOSED
  }

  // Events
  // When a Grant Round is created
  // When a donation is made to a Grant

  uint256 public grantRoundCount = 0;
  mapping(bytes32 => GrantRound) public grantRounds;

  struct GrantRound {
    bytes32 id;
    address owner;
    bytes[] proof;
    bytes32 root;
  }
}
