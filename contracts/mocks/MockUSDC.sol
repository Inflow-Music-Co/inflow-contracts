// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUSDC is ERC20("MockUSDC", "MockUSDC") {
  function mintTo(address to, uint256 _amount) public {
    _mint(to, _amount);
  }

  function mint(uint256 _amount) public {
    _mint(msg.sender, _amount);
  }

  function decimals() public pure override returns (uint8) {
    return 6;
  }
}
