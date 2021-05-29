# Ethereum Price Tracking NFT

* Tracks the price of ETH against USD through Chainlink Price Feeds (automatically updated through the Chainlink Keeper network).

* Updates the token URI based on the daily trend or price of ETH:

    | ETH price trend                          | URI    |
    |------------------------------------------|--------|
    | Price appreciated for 1 day              | base/0 |
    | Price appreciated for 2 consecutive days | base/1 |
    | Price appreciated for 5 consecutive days | base/2 |
    | Price depreciated for 1 day              | base/3 |
    | Price depreciated for 2 consecutive days | base/4 |
    | Price depreciated for 5 consecutive days | base/5 |
    | Price exceeds $20k                       | base/6 |
