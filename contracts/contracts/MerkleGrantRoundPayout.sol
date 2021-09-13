// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.7.6;
pragma abicoder v2;

import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/cryptography/MerkleProof.sol";

/**
 * @notice The `MerkleGrantRoundPayout` contract enables eligible grant owners to claim their
 * match after round ends and funds have been loaded into this contract. They claim their
 * funds in the given `ERC20` token by providing a merkleProof.
 *
 * This contract is intended to work as follows:
 *  - When a `GrantRound` is complete, compute the match payouts for that round
 *  - Generate a Merkle tree of the match payout results
 *  - Deploy an instance of this contract with the associated Merkle root
 *  - Transfer match funds from the `GrantRound` contract to this contract
 *  - Users eligible for match payouts can use the `claim` or `batchClaim` method to claim their funds
 *
 * @dev code sourced from https://github.com/Uniswap/merkle-distributor/blob/0d478d722da2e5d95b7292fd8cbdb363d98e9a93/contracts/MerkleDistributor.sol
 * Changes made:
 *  - `isClaimed` renamed to `hasClaimed`
 *  - `account` renamed to `payee`
 *  - does not implement interface `IMerkleDistributor`
 *  - claim function accepts argument `Claim`
 *  - claim function is public to enable `batchClaims`
 *  - add `batchClaim` function to allow multiple claims in a single transaction
 */
contract MerkleGrantRoundPayout {
  using SafeERC20 for IERC20;

  // --- Data ---
  /// @notice token address in which the funds are to be paid out
  IERC20 public immutable token;

  /// @notice merkle root generated from distribution
  bytes32 public immutable merkleRoot;

  /// @dev packed array of booleans to keep track of claims
  mapping(uint256 => uint256) private claimedBitMap;

  /// --- Types ---
  struct Claim {
    uint256 index; // index in claimedBitmap
    address payee; // address to which the funds are sent
    uint256 amount; // amount to be claimed
    bytes32[] merkleProof; // generated merkle proof
  }

  // --- Event ---
  /// @notice Emitted when claim succeeds
  event Claimed(uint256 index, address payee, uint256 amount);

  constructor(IERC20 _token, bytes32 _merkleRoot) {
    token = _token;
    merkleRoot = _merkleRoot;
  }

  // --- Core methods ---

  /**
   * @notice Marks claim on the claimedBitMap for given index
   * @param _index index in claimedBitMap which has claimed funds
   */
  function _setClaimed(uint256 _index) private {
    uint256 claimedWordIndex = _index / 256;
    uint256 claimedBitIndex = _index % 256;
    claimedBitMap[claimedWordIndex] |= (1 << claimedBitIndex);
  }

  /**
   * @notice Check if grant payee_address has claimed funds.
   * @dev Checks if index has been marked as claimed.
   * @param _index Index in claimedBitMap
   */
  function hasClaimed(uint256 _index) public view returns (bool) {
    uint256 claimedWordIndex = _index / 256;
    uint256 claimedBitIndex = _index % 256;
    uint256 claimedWord = claimedBitMap[claimedWordIndex];

    uint256 mask = (1 << claimedBitIndex);
    return claimedWord & mask == mask;
  }

  /**
   * @notice Claims token to given address and updates claimedBitMap
   * @dev Reverts a claim if inputs are invalid
   * @param _claim Claim
   */
  function claim(Claim calldata _claim) public {
    uint256 _index = _claim.index;
    address _payee = _claim.payee;
    uint256 _amount = _claim.amount;
    bytes32[] calldata _merkleProof = _claim.merkleProof;

    // check if payee has not claimed funds
    require(!hasClaimed(_index), "MerkleGrantRoundPayout: Funds already claimed.");

    // verify the merkle proof
    bytes32 node = keccak256(abi.encodePacked(_index, _payee, _amount));
    require(MerkleProof.verify(_merkleProof, merkleRoot, node), "MerkleGrantRoundPayout: Invalid proof.");

    // mark as claimed and transfer
    _setClaimed(_index);
    token.safeTransfer(_payee, _amount);

    // emit event
    emit Claimed(_index, _payee, _amount);
  }

  /**
   * @notice Batch Claim
   * @dev Useful for batch claims (complete pending claims)
   * @param _claims Array of Claim
   */
  function batchClaim(Claim[] calldata _claims) external {
    for (uint256 i = 0; i < _claims.length; i++) {
      claim(_claims[i]);
    }
  }
}
