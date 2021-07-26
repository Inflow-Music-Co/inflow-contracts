// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

interface IRoyaltiesV1 {
    event SecondarySaleFees(
        uint256 tokenId,
        address[] recipients,
        uint256[] bps
    );

    function getFeeRecipients(uint256 tokenId)
        external
        view
        returns (address payable[] memory);

    function getFeeBps(uint256 tokenId)
        external
        view
        returns (uint256[] memory);
}
