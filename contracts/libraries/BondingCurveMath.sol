// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

library BondingCurveMath {
    /// @dev Calculate linear function
    /// @param x (uint256): Input
    /// @return (uint256): Result
    function lin(uint256 x) internal pure returns (uint256) {
        return 10 * x;
    }

    /// @dev Calculate exponential function
    /// @param x (uint256): Input
    /// @return result (uint256): Result
    function exp(uint256 x) internal pure returns (uint256 result) {
        if (x < 50) {
            result = (10**(50 - x) * 1000) / 11**(50 - x);
        } else if (x == 50) {
            result = 1000;
        } else {
            result = (11**(x - 50) * 1000) / 10**(x - 50);
        }
        result += 26 * x;
        result -= 8;
    }
}
