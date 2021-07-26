// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;
import "../libs/LibPart.sol";

abstract contract AbstractRoyalties {
    mapping(uint256 => LibPart.Part[]) public royalties;

    function _saveRoyalties(uint256 tokenId, LibPart.Part[] memory _royalties)
        internal
    {
        for (uint256 i = 0; i < _royalties.length; i++) {
            require(
                _royalties[i].account != address(0x0),
                "AbstractRoyalties: Recipient should be present"
            );
            require(
                _royalties[i].value != 0,
                "AbstractRoyalties: Royalty value should be positive"
            );
            royalties[tokenId].push(_royalties[i]);
        }
        _onRoyaltiesSet(tokenId, _royalties);
    }

    function _updateAccount(
        uint256 tokenId,
        address from,
        address to
    ) internal {
        uint256 length = royalties[tokenId].length;
        for (uint256 i = 0; i < length; i++) {
            if (royalties[tokenId][i].account == from) {
                royalties[tokenId][i].account = payable(to);
            }
        }
    }

    function _onRoyaltiesSet(uint256 tokenId, LibPart.Part[] memory _royalties)
        internal
        virtual;
}
