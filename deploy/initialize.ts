import * as hre from "hardhat";
import { ethers } from "ethers";
import { getWallet } from "./utils";

const priceOracleAddress = '0x25da536a3FfedF57ef746ebb79f1fa82e60eA7D0';
const storageOrderCompatibleAddress = '0x61ecfA2C8dF06A4f941A8529E4B707488B74e3bE';

// $ hh deploy-zksync --script initialize.ts --network [zkSyncMainnet/zkSyncSepolia]
export default async function () {
  const zkWallet = getWallet();

  const priceOracleArtifact = await hre.artifacts.readArtifact("PriceOracle");
  const priceOracle = new ethers.Contract(
    priceOracleAddress,
    priceOracleArtifact.abi,
    zkWallet
  );

  const storageOrderCompatibleArtifact = await hre.artifacts.readArtifact("StorageOrderCompatible");
  const storageOrderCompatible = new ethers.Contract(
    storageOrderCompatibleAddress,
    storageOrderCompatibleArtifact.abi,
    zkWallet
  );

  // Set price oracle
  let trans = await storageOrderCompatible.connect(zkWallet).setPriceOracle(priceOracle.address);
  await trans.wait();
  console.log(`Set StorageOrderCompatible's price oracle to ${priceOracle.address}`);

  // Add order node
  trans = await storageOrderCompatible.connect(zkWallet).addOrderNode('0xB7eE2d47EE9776183141bfe5218D5298fc22EecF');
  await trans.wait();
  console.log(`Added order node 0xB7eE2d47EE9776183141bfe5218D5298fc22EecF`);

  // Set price
  trans = await priceOracle.connect(zkWallet).reInitialize(10**9, 10**5, 15, 200*1024*1024, 2000);
  await trans.wait();
  console.log('Set basePrice:10^9, bytePrice:10^5, servicePriceRate:15%, sizeLimit:209,715,200byte(200MB), ETH/CRU rate:2000');

  // Get price and place test order
  const price = await storageOrderCompatible.getPrice(5246268, false);
  console.log(`Price: ${ethers.utils.formatEther(price)} $ETH`);

  trans = await storageOrderCompatible.connect(zkWallet).placeOrder('QmfH5zLmBtptUxRSGWazaumGwSsCW3n6P164eRXpbFatmJ', 5246268, false, {value: price});
  await trans.wait();
  console.log(`Placed order`);
}