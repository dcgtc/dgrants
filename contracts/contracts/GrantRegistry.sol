pragma solidity ^0.8.5;

contract GrantRegistry {
  // --- Data ---
  // Grant ID - The hash of the grants meetadata
  bytes32 public grantRegistryId;

  // Metadata Pointer
  string public metaPtr;

  // Grant Pointer Object
  struct Grant {
    bytes32 id;
    address owner;
    address payee;
    string metaPtr;
    bytes32 replaces;
  }

  // Mapping from GrantID to set of Owner Address, Payout Address, Metadata Pointer, Replaces Grant (optional)
  // TODO: Implement safemath for avoiding overflows with ints
  uint256 public grantCount = 0;
  mapping(bytes32 => Grant) public grants;
  bytes32[] public grantIds;

  // --- Events ---
  // When a great is created
  event NewGrant(bytes32 indexed _id, address indexed _owner, address indexed _payout, bytes32 _replaces);

  // --- Constructor ---
  constructor(bytes32 _grantRegistryId, string memory _metaPtr) {
    grantRegistryId = _grantRegistryId;
    metaPtr = _metaPtr;
  }

  // --- Functions ---

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

  // Allow creation of a grant and setting the initial parameters
  function _mint(
    bytes32 _id,
    address _owner,
    address _payout,
    string memory _metaPtr,
    bytes32 _replaces
  ) public {
    grantCount += 1;
    grants[_id] = Grant(_id, _owner, _payout, _metaPtr, _replaces);
    grantIds.push(_id);
    // Emit an event here for grant minted
    emit NewGrant(_id, _owner, _payout, _replaces);
  }
}
