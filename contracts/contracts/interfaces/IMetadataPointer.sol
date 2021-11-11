// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.7.6;

struct MetaPtr {
  // Protocol ID corresponding to a specific protocol. More info at https://github.com/dcgtc/protocol-ids
  uint256 protocol;
  // Pointer to fetch metadata for the specified protocol
  string pointer;
}
