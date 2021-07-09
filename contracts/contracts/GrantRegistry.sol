pragma solidity ^0.8.5;

contract GrantRegistry {
  // --- Data ---
  /// @notice Number of grants stored in this registry
  uint96 public grantCount;

  /// @notice Grant object
  struct Grant {
    uint96 id; // grant ID, as uint96 to pack into same slot as owner (this implies a max of 2^96-1 = 7.9e28 grants)
    address owner; // grant owner (has permissions to modify grant information)
    address payee; // address that receives funds donated to this grant
    string metaPtr; // URL pointing to grant metadata (for off-chain use)
  }

  /// @notice Mapping from Grant ID to grant data
  mapping(uint96 => Grant) public grants; // TODO use an array instead with ID to index it? Which is better? Will array copy full array to memory in `getAllGrants`?

  // --- Events ---
  /// @notice Emitted when a new grant is created
  event GrantCreated(uint96 indexed id, address indexed owner, address indexed payee, string metaPtr);

  /// @notice Emitted when a grant's owner is changed
  event GrantUpdated(uint96 indexed id, address indexed owner, address indexed payee, string metaPtr);

  // --- Core methods ---
  /**
   * @notice Create a new grant in the registry
   * @param _owner Grant owner (has permissions to modify grant information)
   * @param _payee Address that receives funds donated to this grant
   * @param _metaPtr URL pointing to grant metadata (for off-chain use)
   */
  function createGrant(
    address _owner,
    address _payee,
    string memory _metaPtr
  ) external {
    uint96 _id = grantCount;
    grants[_id] = Grant(_id, _owner, _payee, _metaPtr);
    emit GrantCreated(_id, _owner, _payee, _metaPtr);
    grantCount += 1;
  }

  /**
   * @notice Update the owner of a grant
   * @param _id ID of grant to update
   * @param _owner New owner address
   */
  function updateGrantOwner(uint96 _id, address _owner) external {
    Grant storage grant = grants[_id];
    require(msg.sender == grant.owner, "Not authorized");
    grant.owner = _owner;
    emit GrantUpdated(grant.id, grant.owner, grant.payee, grant.metaPtr);
  }

  /**
   * @notice Update the payee of a grant
   * @param _id ID of grant to update
   * @param _payee New payee address
   */
  function updateGrantPayee(uint96 _id, address _payee) external {
    Grant storage grant = grants[_id];
    require(msg.sender == grant.owner, "Not authorized");
    grant.payee = _payee;
    emit GrantUpdated(grant.id, grant.owner, grant.payee, grant.metaPtr);
  }

  /**
   * @notice Update the payee of a grant
   * @param _id ID of grant to update
   * @param _metaPtr New URL that points to grant metadata
   */
  function updateGrantMetaPtr(uint96 _id, string calldata _metaPtr) external {
    Grant storage grant = grants[_id];
    require(msg.sender == grant.owner, "Not authorized");
    grant.metaPtr = _metaPtr;
    emit GrantUpdated(grant.id, grant.owner, grant.payee, grant.metaPtr);
  }

  /**
   * @notice Update multiple fields of a grant at once
   * @dev To leave a field unchanged, you must pass in the same value as the current value
   * @param _id ID of grant to update
   * @param _owner New owner address
   * @param _payee New payee address
   * @param _metaPtr New URL that points to grant metadata
   */
  function updateGrant(
    uint96 _id,
    address _owner,
    address _payee,
    string calldata _metaPtr
  ) external {
    Grant storage grant = grants[_id];
    require(msg.sender == grant.owner, "Not authorized");
    grant.owner = _owner;
    grant.payee = _payee;
    grant.metaPtr = _metaPtr;
    emit GrantUpdated(grant.id, grant.owner, grant.payee, grant.metaPtr);
  }

  // --- View functions ---
  /**
   * @notice Returns an array of all grants and their on-chain data
   * @dev May run out of gas for large values `grantCount`, depending on the node's RpcGasLimit. In these cases,
   * `getGrants` can be used to fetch a subset of grants and aggregate the results of various calls off-chain
   */
  function getAllGrants() public view returns (Grant[] memory) {
    return getGrants(0, grantCount);
  }

  /**
   * @notice Returns a range of grants and their on-chain data
   * @param _startId Grant ID of first grant to return, inclusive, i.e. this grant ID is included in return data
   * @param _endId Grant ID of last grant to return, exclusive, i.e. this grant ID is NOT included in return data
   */
  function getGrants(uint96 _startId, uint96 _endId) public view returns (Grant[] memory) {
    Grant[] memory returnData = new Grant[](_endId - _startId);
    for (uint96 i = _startId; i < _endId; i++) {
      returnData[i - _startId] = grants[i]; // use index of `i - _startId` so index starts at zero
    }
    return returnData;
  }
}
