// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract ETHTrackerNFT is ERC721 {

    constructor() ERC721("ETHTrackerNFT", "ETN") {
        _mint(msg.sender, 0);
    }





}