// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.7.6;

struct MetaPtr {
  uint256 protocol; // mapping from integer to protocol
  string pointer; // pointer to fetch metadata for the specified protocol
}
