
import { ethers, upgrades } from "hardhat";

// $ hh run scripts/deploy.ts --network [mainnet/op-mainnet/arb-mainnet/blast-mainnet/base-mainnet]
// $ hh verify --network [mainnet/op-mainnet/arb-mainnet/blast-mainnet/base-mainnet] <addresse> <args>
async function main() {
  const PriceOracleFactory = await ethers.getContractFactory("PriceOracle");
  const PriceOracle = await upgrades.deployProxy(PriceOracleFactory, []);
  const priceOracle = PriceOracleFactory.attach(PriceOracle.address).connect(ethers.provider);
  // const priceOracle = PriceOracle__factory.connect('', ethers.provider);
  console.log(`Deployed PriceOracle to ${priceOracle.address}`);

  const StorageOrderCompatibleFactory = await ethers.getContractFactory("StorageOrderCompatible");
  const StorageOrderCompatible = await upgrades.deployProxy(StorageOrderCompatibleFactory, []);
  const storageOrderCompatible = PriceOracleFactory.attach(StorageOrderCompatible.address).connect(ethers.provider);
  // const storageOrderCompatible = StorageOrderCompatible__factory.connect('', ethers.provider);
  console.log(`Deployed StorageOrderCompatible to ${storageOrderCompatible.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});