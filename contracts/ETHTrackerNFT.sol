// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract ETHTrackerNFT is ERC721 {

    enum Status {
        Up1,           // 0
        Up2,           // 1
        Up5,           // 2
        Down1,         // 3
        Down2,         // 4
        Down5,         // 5
        twentyThousand // 6
    }

    AggregatorV3Interface private priceFeed;

    Status private _status; // used for token URI
    string private _base;

    int public latestPrice;
    uint public latestDateChecked;

    int16 public trend; // consecutive days price appreciated/depreciated (unchanged if price remains same)


    constructor(string memory baseURI, address priceFeedOracle) ERC721("ETHTrackerNFT", "ETN") {
        _base = baseURI;
        priceFeed = AggregatorV3Interface(priceFeedOracle);
        _mint(msg.sender, 0);
        (int price, uint timestamp) = _getLatestPrice();
        latestPrice = price;
        latestDateChecked = _getDateTimestamp(timestamp);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(tokenId == 0, "Only tokenId 0 exists");
        return string(abi.encodePacked(_base, _status));
    }

    function _getLatestPrice() private view returns (int, uint) {
        (
            uint80 roundID,
            int price,
            uint startedAt,
            uint timestamp,
            uint80 answeredInRound
        ) = priceFeed.latestRoundData();
        return (price, timestamp);
    }

    function _getDateTimestamp(uint timestamp) private pure returns(uint) {
        uint32 secondsInDay = 86_400;

        uint currentDayTimestamp = timestamp % secondsInDay;
        uint currentDateTimestamp = timestamp - currentDayTimestamp;
        return currentDateTimestamp;
    }

    function updatePrice() public {
        (
            int price,
            uint timestamp // the time price feed last updated (not the time oracle called)
        ) = _getLatestPrice();
        uint date = _getDateTimestamp(timestamp);

        require(date != latestDateChecked, "Latest price from price feed has already been set for the day");

        int prevPrice = latestPrice;
        uint prevDate = latestDateChecked;
        uint32 secondsInDay = 86_400;

        if (price - prevPrice > 0) { // price appreciated

            if (prevDate == date - secondsInDay) { // previous check was previous day
                trend > 0 ? trend++ : trend = 1;
            } else {
                trend = 1;
            }

            if (price > 20_000) {
                _status = Status.twentyThousand;
            } else if (trend >= 5) {
                _status = Status.Up5;
            } else if (trend >= 2) {
                _status = Status.Up2;
            } else if (trend == 1) {
                _status = Status.Up1;
            }

        } else if (price - prevPrice < 0) { // price depreciated

            if (prevDate == date - secondsInDay) { // previous check was previous day
                trend < 0 ? trend-- : trend = -1;
            } else {
                trend = -1;
            }

            if (price > 20_000) {
                _status = Status.twentyThousand;
            } else if (trend <= -5) {
                _status = Status.Down5;
            } else if (trend <= 2) {
                _status = Status.Down2;
            } else if (trend <= 1) {
                _status = Status.Down1;
            }

        } else { // price remained same
            // trend and _status remain unchanged
            return;
        }

        latestPrice = price;
        latestDateChecked = date;
    }


}