// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract ETHTrackerNFT is ERC721 {

    enum Status {
        Up1,
        Up2,
        Up5,
        Down1,
        Down2,
        Down5,
        twentyThousand
    }

    AggregatorV3Interface private priceFeed;

    Status private _status; // used for token URI
    string private _base;

    int public latestPrice;
    uint public latestDateChecked;


    constructor() ERC721("ETHTrackerNFT", "ETN") {
        _mint(msg.sender, 0);

        priceFeed = AggregatorV3Interface(0x8A753747A1Fa494EC906cE90E9f37563A8AF630e); // Rinkeby
        _base = "https://base.com/";

        //TODO run _getThePrice and set that as latestPrice
            //TODO set block.timestamp as latestDateChecked... NO, FIGURE OUT THE DATE's timestamp. do date stuff
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(tokenId == 0, "Only tokenId 0 exists");
        return string(abi.encodePacked(_base, _status));
    }

    function _setTokenURI(Status status) private {
        _status = status;
    }

    function _getThePrice() private view returns (int) {
        (
            uint80 roundID,
            int price,
            uint startedAt,
            uint timeStamp,
            uint80 answeredInRound
        ) = priceFeed.latestRoundData();
        return price;
    }



}