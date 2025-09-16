import { setParams, syncNodes, syncPriceOracle, testPlaceOrder } from "./tools";

// base-mainnet
const priceOracleAddress = "0x6e68aBd3151E24BC64096CF66BE600E9aA3078dC";
const storageOrderCompatibleAddress = "0x304568d9A54Dd913454eAdcA79681B8f7C6B3C64";

// $ hh run scripts/initialize.ts --network [blast-mainnet/base-mainnet]
async function main() {
  // sync price oracle
  await syncPriceOracle(storageOrderCompatibleAddress, priceOracleAddress);
  // sync order node
  await syncNodes(storageOrderCompatibleAddress);
  // Set price
  await setParams(priceOracleAddress, { CRU_Native_RATE: 0.5 });
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
