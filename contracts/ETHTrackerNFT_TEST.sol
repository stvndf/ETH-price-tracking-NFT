// SPDX-License-Identifier: MIT

pragma solidity 0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

import "hardhat/console.sol";

contract ETHTrackerNFT_TEST is ERC721 {

    using Strings for uint256;

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
        (int price, uint timestamp) = _getLatestPrice(2000_00000000, 1609459200); //NOTE params only for testing
        latestPrice = price;
        latestDateChecked = _getDateTimestamp(timestamp);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(tokenId == 0, "Only tokenId 0 exists");
        return string(abi.encodePacked(_base, uint(_status).toString()));
    }

    // function _getLatestPrice() private view returns (int, uint) {
    //     (
    //         uint80 roundID,
    //         int price,
    //         uint startedAt,
    //         uint timestamp,
    //         uint80 answeredInRound
    //     ) = priceFeed.latestRoundData();
    //     return (price, timestamp);
    // }

    function _getLatestPrice(int price, uint timestamp) private pure returns (int, uint) {
        //NOTE DO NOT USE IN REAL CONTRACT. For testing purposes only (to pass through any price and timestamp).
        return (price, timestamp);
    }

    function _getDateTimestamp(uint timestamp) private pure returns(uint) {
        uint32 secondsInDay = 86_400;

        uint currentDayTimestamp = timestamp % secondsInDay;
        uint currentDateTimestamp = timestamp - currentDayTimestamp;
        return currentDateTimestamp;
    }

    function TEST_UpdatePrice(int price, uint timestamp) public {
        //NOTE DO NOT USE IN REAL CONTRACT. For testing purposes only (to pass through any price and timestamp).

        (
            price,
            timestamp // the time price feed last updated (not the time oracle called)
        ) = _getLatestPrice(price, timestamp);
        uint date = _getDateTimestamp(timestamp);
        require(date != latestDateChecked, "Latest available price from price feed has already been set for the day");

        int prevPrice = latestPrice;
        uint prevDate = latestDateChecked;
        uint32 secondsInDay = 86_400;

        if (price - prevPrice > 0) { // price appreciated

            if (prevDate == date - secondsInDay) { // previous check was previous day
                trend > 0 ? trend++ : trend = 1;
            } else {
                trend = 1;
            }

            if (price >= 20000_00000000) {
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

            if (price >= 20000_00000000) { // 8 decimal places
                _status = Status.twentyThousand;
            } else if (trend <= -5) {
                _status = Status.Down5;
            } else if (trend <= -2) {
                _status = Status.Down2;
            } else if (trend == -1) {
                _status = Status.Down1;
            }
        } else if (price - prevPrice == 0) { // price static
            if (prevDate != date - secondsInDay) { // previous check was not previous day
                trend > 0 ? trend = 1 : trend = -1;

                if (price >= 20000_00000000) {
                    _status = Status.twentyThousand;
                } else if (trend >= 5) {
                    _status = Status.Up5;
                } else if (trend >= 2) {
                    _status = Status.Up2;
                } else if (trend == 1) {
                    _status = Status.Up1;
                } else if (trend <= -5) {
                _status = Status.Down5;
                } else if (trend <= -2) {
                    _status = Status.Down2;
                } else if (trend == -1) {
                    _status = Status.Down1;
                }
            } // else trend and _status remain unchanged
        }

        latestPrice = price;
        latestDateChecked = date;
    }

}