const { assert, expect } = require("chai");
const Contract = artifacts.require("ETHTrackerNFT_TEST");

contract("ETHTrackerNFT_TEST", () => {
  let contract;
  const baseURI = "https://base.com/";
  const oracle = "0x9326BFA02ADD2366b30bacB125260Af641031331";

  function timestamp(date, hour = 0) {
    return new Date(2021, 0, date).setHours(hour) / 1000;
  }

  beforeEach(async () => {
    contract = await Contract.new(baseURI, oracle);
  });

  it("dates convert properly and latestDateChecked is set", async () => {
    // caveat: not setting it through the oracle in these tests
    let latestDateChecked;

    latestDateChecked = await contract.latestDateChecked(); // constructor
    assert.equal(latestDateChecked.toString(), timestamp(1));

    await contract.TEST_UpdatePrice(2500, timestamp(2));
    latestDateChecked = await contract.latestDateChecked();
    assert.equal(latestDateChecked.toString(), timestamp(2));

    await contract.TEST_UpdatePrice(2400, timestamp(3, 12)); // part way through day
    latestDateChecked = await contract.latestDateChecked();
    assert.equal(latestDateChecked.toString(), timestamp(3));

    await contract.TEST_UpdatePrice(2400, timestamp(4));
    latestDateChecked = await contract.latestDateChecked();
    assert.equal(latestDateChecked.toString(), timestamp(4));

    await contract.TEST_UpdatePrice(2500, timestamp(31));
    latestDateChecked = await contract.latestDateChecked();
    assert.equal(latestDateChecked.toString(), timestamp(31));
  });

  it("latestPrice is set", async () => {
    let latestPrice;

    latestPrice = await contract.latestPrice(); // constructor
    assert.equal(latestPrice.toNumber(), 2000_00000000); // 8 decimals

    await contract.TEST_UpdatePrice(2500_00000000, timestamp(2, 3));
    latestPrice = await contract.latestPrice();
    assert.equal(latestPrice.toString(), 2500_00000000);

    await contract.TEST_UpdatePrice(2500_00000000, timestamp(3)); // same
    latestPrice = await contract.latestPrice();
    assert.equal(latestPrice.toString(), 2500_00000000);

    await contract.TEST_UpdatePrice(500_00000000, timestamp(5, 15));
    latestPrice = await contract.latestPrice();
    assert.equal(latestPrice.toString(), 500_00000000);
  });

  describe("Trend and tokenURI update correctly", async () => {
    it("Increases", async () => {
      let trend;
      let tokenURI;

      const latestPrice = await contract.latestPrice(); // constructor
      assert.equal(latestPrice.toNumber(), 2000_00000000); // checking starting position

      assert.equal(await contract.trend(), 0); // starting at Up1

      await contract.TEST_UpdatePrice(2100_00000000, timestamp(2));
      trend = await contract.trend();
      tokenURI = await contract.tokenURI(0);
      assert.equal(trend.toNumber(), 1);
      assert.equal(tokenURI, baseURI + 0); // Up1

      await contract.TEST_UpdatePrice(2200_00000000, timestamp(3));
      trend = await contract.trend();
      tokenURI = await contract.tokenURI(0);
      assert.equal(trend.toNumber(), 2);
      assert.equal(tokenURI, baseURI + 1); // Up2

      await contract.TEST_UpdatePrice(2300_00000000, timestamp(4));
      trend = await contract.trend();
      tokenURI = await contract.tokenURI(0);
      assert.equal(trend.toNumber(), 3);
      assert.equal(tokenURI, baseURI + 1); // Up2

      await contract.TEST_UpdatePrice(2400_00000000, timestamp(5));
      trend = await contract.trend();
      tokenURI = await contract.tokenURI(0);
      assert.equal(trend.toNumber(), 4);
      assert.equal(tokenURI, baseURI + 1); // Up2

      await contract.TEST_UpdatePrice(2500_00000000, timestamp(6));
      trend = await contract.trend();
      tokenURI = await contract.tokenURI(0);
      assert.equal(trend.toNumber(), 5);
      assert.equal(tokenURI, baseURI + 2); // Up3

      await contract.TEST_UpdatePrice(2600_00000000, timestamp(7));
      trend = await contract.trend();
      tokenURI = await contract.tokenURI(0);
      assert.equal(trend.toNumber(), 6);
      assert.equal(tokenURI, baseURI + 2); // Up3
    });

    it("Decreases", async () => {
      let trend;
      let tokenURI;

      const latestPrice = await contract.latestPrice(); // constructor
      assert.equal(latestPrice.toNumber(), 2000_00000000); // checking starting position

      assert.equal(await contract.trend(), 0); // starting at Up1

      await contract.TEST_UpdatePrice(1900_00000000, timestamp(2));
      trend = await contract.trend();
      tokenURI = await contract.tokenURI(0);
      assert.equal(trend.toNumber(), -1);
      assert.equal(tokenURI, baseURI + 3); // Down1

      await contract.TEST_UpdatePrice(1800_00000000, timestamp(3));
      trend = await contract.trend();
      tokenURI = await contract.tokenURI(0);
      assert.equal(trend.toNumber(), -2);
      assert.equal(tokenURI, baseURI + 4); // Down2

      await contract.TEST_UpdatePrice(1700_00000000, timestamp(4));
      trend = await contract.trend();
      tokenURI = await contract.tokenURI(0);
      assert.equal(trend.toNumber(), -3);
      assert.equal(tokenURI, baseURI + 4); // Down2

      await contract.TEST_UpdatePrice(1600_00000000, timestamp(5));
      trend = await contract.trend();
      tokenURI = await contract.tokenURI(0);
      assert.equal(trend.toNumber(), -4);
      assert.equal(tokenURI, baseURI + 4); // Down2

      await contract.TEST_UpdatePrice(1500_00000000, timestamp(6));
      trend = await contract.trend();
      tokenURI = await contract.tokenURI(0);
      assert.equal(trend.toNumber(), -5);
      assert.equal(tokenURI, baseURI + 5); // Down3

      await contract.TEST_UpdatePrice(1400_00000000, timestamp(7));
      trend = await contract.trend();
      tokenURI = await contract.tokenURI(0);
      assert.equal(trend.toNumber(), -6);
      assert.equal(tokenURI, baseURI + 5); // Down3
    });

    it("Static, also returns back down properly", async () => {
      let trend;
      let tokenURI;

      const latestPrice = await contract.latestPrice(); // constructor
      assert.equal(latestPrice.toNumber(), 2000_00000000); // checking starting position

      assert.equal(await contract.trend(), 0); // starting at Up1

      await contract.TEST_UpdatePrice(2100_00000000, timestamp(2));
      trend = await contract.trend();
      tokenURI = await contract.tokenURI(0);
      assert.equal(trend.toNumber(), 1);
      assert.equal(tokenURI, baseURI + 0); // Up1

      await contract.TEST_UpdatePrice(2200_00000000, timestamp(3));
      trend = await contract.trend();
      tokenURI = await contract.tokenURI(0);
      assert.equal(trend.toNumber(), 2);
      assert.equal(tokenURI, baseURI + 1); // Up2

      await contract.TEST_UpdatePrice(2200_00000000, timestamp(4));
      trend = await contract.trend();
      tokenURI = await contract.tokenURI(0);
      assert.equal(trend.toNumber(), 2);
      assert.equal(tokenURI, baseURI + 1); // Up2

      await contract.TEST_UpdatePrice(2100_00000000, timestamp(5));
      trend = await contract.trend();
      tokenURI = await contract.tokenURI(0);
      assert.equal(trend.toNumber(), -1);
      assert.equal(tokenURI, baseURI + 3); // Down1

      await contract.TEST_UpdatePrice(2100_00000000, timestamp(6));
      trend = await contract.trend();
      tokenURI = await contract.tokenURI(0);
      assert.equal(trend.toNumber(), -1);
      assert.equal(tokenURI, baseURI + 3); // Down1
    });

    it("20k, also returns back down properly", async () => {
      let trend;
      let tokenURI;

      const latestPrice = await contract.latestPrice(); // constructor
      assert.equal(latestPrice.toNumber(), 2000_00000000); // checking starting position

      assert.equal(await contract.trend(), 0); // starting at Up1

      await contract.TEST_UpdatePrice(1900_00000000, timestamp(2));
      trend = await contract.trend();
      tokenURI = await contract.tokenURI(0);
      assert.equal(trend.toNumber(), -1);
      assert.equal(tokenURI, baseURI + 3); // Down1

      await contract.TEST_UpdatePrice(20000_00000000, timestamp(3));
      trend = await contract.trend();
      tokenURI = await contract.tokenURI(0);
      assert.equal(trend.toNumber(), 1);
      assert.equal(tokenURI, baseURI + 6); // 20k

      await contract.TEST_UpdatePrice(21000_00000000, timestamp(4));
      trend = await contract.trend();
      tokenURI = await contract.tokenURI(0);
      assert.equal(trend.toNumber(), 2);
      assert.equal(tokenURI, baseURI + 6); // 20k

      await contract.TEST_UpdatePrice(20000_00000000, timestamp(5));
      trend = await contract.trend();
      tokenURI = await contract.tokenURI(0);
      assert.equal(trend.toNumber(), -1);
      assert.equal(tokenURI, baseURI + 6); // 20k

      await contract.TEST_UpdatePrice(19000_00000000, timestamp(6));
      trend = await contract.trend();
      tokenURI = await contract.tokenURI(0);
      assert.equal(trend.toNumber(), -2);
      assert.equal(tokenURI, baseURI + 4); // Down2
    });

    it("Skipping days resets", async () => {
      let trend;
      let tokenURI;

      const latestPrice = await contract.latestPrice(); // constructor
      assert.equal(latestPrice.toNumber(), 2000_00000000); // checking starting position

      assert.equal(await contract.trend(), 0); // starting at Up1

      await contract.TEST_UpdatePrice(1900_00000000, timestamp(2));
      trend = await contract.trend();
      tokenURI = await contract.tokenURI(0);
      assert.equal(trend.toNumber(), -1);
      assert.equal(tokenURI, baseURI + 3); // Down1

      await contract.TEST_UpdatePrice(1800_00000000, timestamp(3));
      trend = await contract.trend();
      tokenURI = await contract.tokenURI(0);
      assert.equal(trend.toNumber(), -2);
      assert.equal(tokenURI, baseURI + 4); // Down2

      await contract.TEST_UpdatePrice(1700_00000000, timestamp(5));
      trend = await contract.trend();
      tokenURI = await contract.tokenURI(0);
      assert.equal(trend.toNumber(), -1);
      assert.equal(tokenURI, baseURI + 3); // Down1

      await contract.TEST_UpdatePrice(1600_00000000, timestamp(6));
      trend = await contract.trend();
      tokenURI = await contract.tokenURI(0);
      assert.equal(trend.toNumber(), -2);
      assert.equal(tokenURI, baseURI + 4); // Down2

      await contract.TEST_UpdatePrice(1600_00000000, timestamp(9));
      trend = await contract.trend();
      tokenURI = await contract.tokenURI(0);
      assert.equal(trend.toNumber(), -1);
      assert.equal(tokenURI, baseURI + 3); // Down1

      await contract.TEST_UpdatePrice(2100_00000000, timestamp(10));
      trend = await contract.trend();
      tokenURI = await contract.tokenURI(0);
      assert.equal(trend.toNumber(), 1);
      assert.equal(tokenURI, baseURI + 0); // Up1

      await contract.TEST_UpdatePrice(2200_00000000, timestamp(11));
      trend = await contract.trend();
      tokenURI = await contract.tokenURI(0);
      assert.equal(trend.toNumber(), 2);
      assert.equal(tokenURI, baseURI + 1); // Up2

      await contract.TEST_UpdatePrice(2200_00000000, timestamp(13));
      trend = await contract.trend();
      tokenURI = await contract.tokenURI(0);
      assert.equal(trend.toNumber(), 1);
      assert.equal(tokenURI, baseURI + 0); // Up1

      await contract.TEST_UpdatePrice(20000_00000000, timestamp(14));
      trend = await contract.trend();
      tokenURI = await contract.tokenURI(0);
      assert.equal(trend.toNumber(), 2);
      assert.equal(tokenURI, baseURI + 6); // 20k

      await contract.TEST_UpdatePrice(20000_00000000, timestamp(16));
      trend = await contract.trend();
      tokenURI = await contract.tokenURI(0);
      assert.equal(trend.toNumber(), 1);
      assert.equal(tokenURI, baseURI + 6); // 20k
    });
  });

  describe("Keeper network functionality", () => {
    // caveat: not setting it through the oracle in these tests

    it("checkUpkeep", async () => {
      let checkUpkeep;

      checkUpkeep = await contract.checkUpkeep("0x0", 2100_00000000, timestamp(1));
      assert.equal(checkUpkeep.upkeepNeeded, false)
      checkUpkeep = await contract.checkUpkeep("0x0", 2100_00000000, timestamp(2));
      assert.equal(checkUpkeep.upkeepNeeded, true)
    })

    it("performUpkeep", async () => {
      let trend;
      let tokenURI;

      await contract.performUpkeep("0x0", 2100_00000000, timestamp(2));
      trend = await contract.trend();
      tokenURI = await contract.tokenURI(0);
      assert.equal(trend.toNumber(), 1);
      assert.equal(tokenURI, baseURI + 0); // Up1

      await contract.performUpkeep("0x0", 2000_00000000, timestamp(3));
      trend = await contract.trend();
      tokenURI = await contract.tokenURI(0);
      assert.equal(trend.toNumber(), -1);
      assert.equal(tokenURI, baseURI + 3); // Down1
    })
  });
});
