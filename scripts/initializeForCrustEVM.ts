import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import dotenv from "dotenv";
import { ethers } from "hardhat";
import { PriceOracle__factory, StorageOrderCompatible__factory } from "../typechain";

dotenv.config();

// base-mainnet
const priceOracleAddress = "0xDC96C3113c292Ef40b13F0488056E526e38ca905";
const storageOrderCompatibleAddress = "0xA40179e57280585D88899b2032E7eCF13B3B6c72";

// $ hh run scripts/initialize.ts --network [blast-mainnet/base-mainnet]
async function main() {
  const [signer]: SignerWithAddress[] = await ethers.getSigners();
  console.log(`Signer address: ${signer.address}`);

  const priceOracle = PriceOracle__factory.connect(priceOracleAddress, signer);
  const storageOrderCompatible = StorageOrderCompatible__factory.connect(storageOrderCompatibleAddress, signer);

  // Set price oracle
  if ((await storageOrderCompatible.priceOracle()) !== priceOracleAddress) {
    await storageOrderCompatible
      .connect(signer)
      .setPriceOracle(priceOracle.address)
      .then((tx) => tx.wait(2));
    console.log(`Set StorageOrderCompatible's price oracle to ${priceOracle.address}`);
  }

  // Add order node
  await storageOrderCompatible
    .connect(signer)
    .addOrderNode("0xB7eE2d47EE9776183141bfe5218D5298fc22EecF")
    .then((tx) => tx.wait(2));
  console.log(`Added order node 0xB7eE2d47EE9776183141bfe5218D5298fc22EecF`);

  // Set price
  await priceOracle
    .connect(signer)
    .reInitialize(10 ** 9, 10 ** 5, 15, 200 * 1024 * 1024, 1)
    .then((tx) => tx.wait(2));

  console.log("Set basePrice:10^9, bytePrice:10^5, servicePriceRate:15%, sizeLimit:209,715,200byte(200MB), ETH(CRU)/CRU rate:1");

  // Get price and place test order
  const price = await storageOrderCompatible.getPrice(5246268, false);
  console.log(`Price: ${ethers.utils.formatEther(price)} $ETH`);

  await storageOrderCompatible
    .connect(signer)
    .placeOrder("QmfH5zLmBtptUxRSGWazaumGwSsCW3n6P164eRXpbFatmJ", 5246268, false, { value: price })
    .then((tx) => tx.wait(2));

  console.log(`Placed order`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
