import { setParams, syncNodes, syncPriceOracle, testPlaceOrder } from "./tools";

// base-mainnet
const priceOracleAddress = "0xDC96C3113c292Ef40b13F0488056E526e38ca905";
const storageOrderCompatibleAddress = "0xA40179e57280585D88899b2032E7eCF13B3B6c72";

// $ hh run scripts/initialize.ts --network [blast-mainnet/base-mainnet]
async function main() {
  // sync price oracle
  await syncPriceOracle(storageOrderCompatibleAddress, priceOracleAddress);
  // sync order node
  await syncNodes(storageOrderCompatibleAddress);
  // Set price
  await setParams(priceOracleAddress, { CRU_Native_RATE: 1 });
  // test placeOrder
  await testPlaceOrder(storageOrderCompatibleAddress);

  console.log(`Placed order`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
