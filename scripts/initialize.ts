
import dotenv from "dotenv";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  PriceOracle__factory,
  StorageOrderCompatible__factory
} from '../typechain';

dotenv.config();

const priceOracleAddress = '0xF878bEa1De447d5330ab17f7a62f421695ba09A5';
const storageOrderCompatibleAddress = '0xf063A29f03d0A02FD96f270EE4F59158EF3d4860';

async function initBlast(signer: SignerWithAddress) {
  const storageOrderCompatible = StorageOrderCompatible__factory.connect(storageOrderCompatibleAddress, signer);

  const treasuryAddress = '0xDfc968aA66A31C25fc999e57E4FFc39104Db94E3';
  const blastAddress = '0x4300000000000000000000000000000000000002';
  const blastPointsAddress = '0x2536FE9ab3F511540F2f9e2eC2A805005C3Dd800';
  const blastPointsOperator = '0xF36A35DD383a407E25e8bD2036b93414841cd1C2';

  // Set treasury address
  let trans = await storageOrderCompatible.connect(signer).setTreasury(treasuryAddress);
  await trans.wait();
  console.log(`Set StorageOrderCompatible's treasury to ${treasuryAddress}`);

  // Set blast address
  trans = await storageOrderCompatible.connect(signer).setBlast(blastAddress);
  await trans.wait();
  console.log(`Set StorageOrderCompatible's blast to ${blastAddress}`);

  // Set blast points address
  trans = await storageOrderCompatible.connect(signer).setBlastPointsAddress(blastPointsAddress, blastPointsOperator);
  await trans.wait();
  console.log(`Set StorageOrderCompatible's blast points address to ${blastPointsAddress} with operator ${blastPointsOperator}`);
}

// $ hh run scripts/initialize.ts --network [mainnet/op-mainnet/arb-mainnet/blast-mainnet/base-mainnet]
async function main() {
  const [signer]: SignerWithAddress[] = await ethers.getSigners();
  console.log(`Signer address: ${signer.address}`);

  const priceOracle = PriceOracle__factory.connect(priceOracleAddress, signer);
  const storageOrderCompatible = StorageOrderCompatible__factory.connect(storageOrderCompatibleAddress, signer);

  // await initBlast(signer);

  // Set price oracle
  let trans = await storageOrderCompatible.connect(signer).setPriceOracle(priceOracle.address);
  await trans.wait();
  console.log(`Set StorageOrderCompatible's price oracle to ${priceOracle.address}`);

  // Add order node
  trans = await storageOrderCompatible.connect(signer).addOrderNode('0xB7eE2d47EE9776183141bfe5218D5298fc22EecF');
  await trans.wait();
  console.log(`Added order node 0xB7eE2d47EE9776183141bfe5218D5298fc22EecF`);

  // Set price
  trans = await priceOracle.connect(signer).reInitialize(10**9, 10**5, 15, 200*1024*1024, 2000);
  await trans.wait();
  console.log('Set basePrice:10^9, bytePrice:10^5, servicePriceRate:15%, sizeLimit:209,715,200byte(200MB), ETH/CRU rate:2000');

  // Get price and place test order
  const price = await storageOrderCompatible.getPrice(5246268, false);
  console.log(`Price: ${ethers.utils.formatEther(price)} $ETH`);

  trans = await storageOrderCompatible.connect(signer).placeOrder('QmfH5zLmBtptUxRSGWazaumGwSsCW3n6P164eRXpbFatmJ', 5246268, false, {value: price});
  await trans.wait();
  console.log(`Placed order`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});