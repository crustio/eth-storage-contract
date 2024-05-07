import * as hre from "hardhat";
import dotenv from "dotenv";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";

import { getWallet } from "./utils";

dotenv.config();

// $ hh deploy-zksync --script deploy.ts --network [zkSyncMainnet/zkSyncSepolia]
// $ hh verify --network [zkSyncMainnet/zkSyncSepolia] <addresse> <args>
export default async function () {
  const zkWallet = getWallet();
  const deployer = new Deployer(hre, zkWallet);
  console.log(`Deployer account: ${deployer.zkWallet.address}`);

  const PriceOracle = await deployer.loadArtifact("PriceOracle");
  const priceOracle = await hre.zkUpgrades.deployProxy(deployer.zkWallet, PriceOracle, [], { initializer: "initialize" });
  await priceOracle.deployed();
  console.log(`Deployed PriceOracle to ${priceOracle.address}`);

  const StorageOrderCompatible = await deployer.loadArtifact("StorageOrderCompatible");
  const storageOrderCompatible = await hre.zkUpgrades.deployProxy(deployer.zkWallet, StorageOrderCompatible, [], { initializer: "initialize" });
  await storageOrderCompatible.deployed();
  console.log(`Deployed StorageOrderCompatible to ${storageOrderCompatible.address}`);
}
