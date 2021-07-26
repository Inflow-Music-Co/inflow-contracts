// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

library FeeLib {
    /// @dev Returns new value and fee used to compute new value
    /// @param value (uint256): Current value to operate on, which can equal total
    /// @param total (uint256): Total value, which can equal value
    /// @param feeInBp (uint256): Fee in basis points
    /// @return newValue (uint256): Value less fee
    /// @return realFee (uint256): Fee used to compute newValue
    function subFeeInBp(
        uint256 value,
        uint256 total,
        uint256 feeInBp
    ) internal pure returns (uint256 newValue, uint256 realFee) {
        return subFee(value, bp(total, feeInBp));
    }

    /// @dev Returns new value and fee used to compute new value
    /// @param value (uint256): Value to subtract fee from
    /// @param fee (uint256): Fee to subtract from value
    /// @return newValue (uint256): Value less fee
    /// @return realFee (uint256): Fee used to compute newValue
    function subFee(uint256 value, uint256 fee)
        internal
        pure
        returns (uint256 newValue, uint256 realFee)
    {
        if (value > fee) {
            newValue = value - fee;
            realFee = fee;
        } else {
            newValue = 0;
            realFee = value;
        }
    }

    /// @dev Returns product of value and feeInBP formatted from basis point representation
    /// @param value (uint256): Total value
    /// @param feeInBp (uint256): Fee in basis points
    /// @return (uint256): Product of value and feeInBP formatted from basis point representation
    function bp(uint256 value, uint256 feeInBp)
        internal
        pure
        returns (uint256)
    {
        return (value * feeInBp) / 10000;
    }
}
