pragma solidity ^0.8.4;

contract GrantRegistry {
  // Grant ID - The hash of the grants meetadata
  bytes32 public grantRegistryId;
  // Metadata Pointer
  string public metaPtr;

  // Owner
  address owner;

  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  // TODO: Only allow the owner (which is the curator) address to configure the contract
  // while its in config mode, then switch to active. Once active, the owner can only
  // close the registry (have a conversation around this approach)
  constructor(address _owner, bytes32 _grantRegistryId, string memory _metaPtr) {
    owner = _owner;
    //state = State.CONFIG;
    grantRegistryId = _grantRegistryId;
    metaPtr = _metaPtr;
  }

  // State
  enum State { CONFIG, ACTIVE, CLOSED }
  //State public state;

  // Grant Pointer Object
  // Mapping from GrantID to set of Owner Address, Payout Address, Metadata Pointer, Replaces Grant (optional)
  // TODO: Implement safemath for avoiding overflows with ints
  uint256 public grantCount = 0;
  mapping(bytes32 => Grant) public grants;
  bytes32[] public grantIds;

  struct Grant {
    bytes32 id;
    address owner;
    address payout;
    string metaPtr;
    State state;
    bytes32 replaces;
  }

  function activate(bytes32 _id)
    onlyOwner
    external
  {
    grants[_id].state = State.ACTIVE;
  }

  function closed(bytes32 _id) public onlyOwner {
    grants[_id].state = State.CLOSED;
  }

  function isConfig(bytes32 _id) public view returns(bool) {
    return grants[_id].state == State.CONFIG;
  }

  function isActive(bytes32 _id) public view returns(bool) {
    return grants[_id].state == State.ACTIVE;
  }

  function isClosed(bytes32 _id) public view returns(bool) {
    return grants[_id].state == State.CLOSED;
  }

  function getGrantCount() public view returns(uint256) {
    return grantCount;
  }

  function getAllGrantIds() public view returns (bytes32[] memory) {
    bytes32[] memory ret = new bytes32[](grantCount);
    for (uint i = 0; i < grantCount; i++) {
      ret[i] = grantIds[i];
    }
    return grantIds;
  }

  function getAllGrants() public view returns (Grant[] memory) {
    Grant[] memory ret = new Grant[](grantCount);
    bytes32 grantId;
    for (uint i = 0; i < grantCount; i++) {
      grantId = grantIds[i];
      ret[i] = grants[grantId];
    }
    return ret;
  }

/*
  function getAllGrants() public view returns (myGrant[] memory) {
    grantCount = getGrantCount();
    myGrant[] memory ret = new myGrant[](grantCount);
    for (uint i = 0; i < grantCount; i++) {
      ret[i] = grants[i];
    }
    return ret;
  }
*/

  // Events
  // When a great is created
  event NewGrant(bytes32 indexed _id, address indexed _owner, address indexed _payout, bytes32 _replaces);
  // When a grant receives a donation (directly to a grant, or from contract)
  // When a grant changes statuses

  // _mint function
  // Allow creation of a grant and setting the initial parameters
  function _mint(bytes32 _id, address _owner, address _payout, string memory _metaPtr, State _state, bytes32 _replaces) public {
    incrementGrantCount();
    grants[_id] = Grant(_id, _owner, _payout, _metaPtr, _state, _replaces);
    grantIds.push(_id);
    // Emit an event here for grant minted
    emit NewGrant(_id, _owner, _payout, _replaces);
  }

  function incrementGrantCount() internal {
    grantCount += 1;
  }
}
