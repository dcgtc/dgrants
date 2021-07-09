pragma solidity ^0.8.5;

contract GrantRegistry {
  // Grant ID - The hash of the grants meetadata
  bytes32 public grantRegistryId;

  // Metadata Pointer
  string public metaPtr;

  constructor(bytes32 _grantRegistryId, string memory _metaPtr) {
    grantRegistryId = _grantRegistryId;
    metaPtr = _metaPtr;
  }

  // Grant Pointer Object
  // Mapping from GrantID to set of Owner Address, Payout Address, Metadata Pointer, Replaces Grant (optional)
  uint256 public grantCount = 0;
  mapping(bytes32 => Grant) public grants;
  bytes32[] public grantIds;

  struct Grant {
    bytes32 id;
    address owner;
    address payoutAddr;
    string metaPtr;
    State state;
    bytes32 replaces;
  }

  function activateGrant(bytes32 _id) external onlyOwner {
    grants[_id].state = State.ACTIVE;
    emit GrantStatusChange(_id, State.ACTIVE);
  }

  function closeGrant(bytes32 _id) public onlyOwner {
    grants[_id].state = State.CLOSED;
    emit GrantStatusChange(_id, State.CLOSED);
  }

  function isConfig(bytes32 _id) public view returns (bool) {
    return grants[_id].state == State.CONFIG;
  }

  function isActive(bytes32 _id) public view returns (bool) {
    return grants[_id].state == State.ACTIVE;
  }

  function isClosed(bytes32 _id) public view returns (bool) {
    return grants[_id].state == State.CLOSED;
  }

  function getAllGrantIds() public view returns (bytes32[] memory) {
    bytes32[] memory ret = new bytes32[](grantCount);
    for (uint256 i = 0; i < grantCount; i++) {
      ret[i] = grantIds[i];
    }
    return grantIds;
  }

  function getAllGrants() public view returns (Grant[] memory) {
    Grant[] memory ret = new Grant[](grantCount);
    bytes32 grantId;
    for (uint256 i = 0; i < grantCount; i++) {
      grantId = grantIds[i];
      ret[i] = grants[grantId];
    }
    return ret;
  }

  // Events
  // When a great is created
  event NewGrant(bytes32 indexed _id, address indexed _owner, address indexed _payoutAddr, bytes32 _replaces);

  // When a grant receives a donation (directly to a grant, or from contract)
  // When a grant changes statuses
  event GrantStatusChange(bytes32 indexed _id, State _state);

  // _mint function
  // Allow creation of a grant and setting the initial parameters
  function _mint(
    address _owner,
    address _payoutAddr,
    string memory _metaPtr,
    State _state,
    bytes32 _replaces
  ) public {
    grantCount++;
    // Should we define ID here before using it both to create the grant and emit the event?
    grants[grantCount] = Grant(grantCount, _owner, _payoutAddr, _metaPtr, _state, _replaces);
    // Emit an event here for grant minted
    emit NewGrant(grantCount, _owner, _payoutAddr, _replaces);
  }
}
