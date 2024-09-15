// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockToken is ERC20 {
    uint8 private _decimals;
    string public _name;
    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals_,
        uint256 initialSupply
    ) ERC20(name, symbol) {
        _decimals = decimals_;
        _name = name;
        _mint(msg.sender, initialSupply * (10 ** uint256(_decimals)));
    }

    function decimals() public view virtual override returns (uint8) {
      return _decimals;
    }
}

// import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// contract MockToken is ERC20 {
//     constructor(string memory name, string memory symbol, uint256 initialSupply) ERC20(name, symbol) {
//         _mint(msg.sender, initialSupply);
//     }
// }
