pragma solidity ^0.8.6;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockToken is ERC20 {
  constructor(uint256 initialSupply) ERC20("Mock", "MCK") {
    _mint(msg.sender, initialSupply);
  }

  function mint(uint256 initialSupply) external {
    _mint(msg.sender, initialSupply);
  }
}
