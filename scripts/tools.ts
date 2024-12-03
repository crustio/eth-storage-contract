import { ApiPromise, WsProvider } from "@polkadot/api";
import { BigNumber, BigNumberish } from "ethers";
import { ethers } from "hardhat";

export const NODES = ["0xB7eE2d47EE9776183141bfe5218D5298fc22EecF"];

export async function syncNodes(storage: string) {
  const [deployer] = await ethers.getSigners();
  const storageFactory = await ethers.getContractFactory("StorageOrderCompatible");
  const storageImp = storageFactory.attach(storage).connect(deployer);
  const nodesCount = (await storageImp.getNodesNumber()).toNumber();
  const remoteNodes = new Array<string>(nodesCount);
  for (let index = 0; index < nodesCount; index++) {
    remoteNodes[index] = await storageImp.nodeArray(index);
  }
  // remove
  for (const node of remoteNodes) {
    if (!NODES.find((item) => item.toLowerCase() == node.toLowerCase())) {
      await storageImp.removeOrderNode(node).then((tx) => tx.wait(2));
      console.log("Remove Deprecated node:", node);
    }
  }
  // add new
  for (const node of NODES) {
    if (!remoteNodes.find((item) => item.toLowerCase() == node.toLowerCase())) {
      await storageImp.addOrderNode(node).then((tx) => tx.wait(2));
      console.log("Add node:", node);
    }
  }
  console.log(`Synced nodes`);
}

export async function syncPriceOracle(storage: string, priceOracle: string) {
  const [deployer] = await ethers.getSigners();
  const storageFactory = await ethers.getContractFactory("StorageOrderCompatible");
  const storageImp = storageFactory.attach(storage).connect(deployer);
  if ((await storageImp.priceOracle()) !== priceOracle) {
    await storageImp
      .connect(deployer)
      .setPriceOracle(priceOracle)
      .then((tx) => tx.wait(2));
    console.log(`PriceOracle update ${priceOracle}`);
  } else {
    console.log(`priceOracle not update`);
  }
}

import { typesBundleForPolkadot } from "@crustio/type-definitions";
import { parseUnits } from "ethers/lib/utils";
const wss = ["wss://rpc.crust.network", "wss://rpc-crust-mainnet.decoo.io"];
export async function getCrustFileFee() {
  const provider = new WsProvider(wss, 5000);
  const api = await new ApiPromise({
    provider,
    typesBundle: typesBundleForPolkadot,
  }).isReady;
  const baseFee = await api.query.market.fileBaseFee();
  const byteFee = await api.query.market.fileByteFee();
  console.info("fees:", baseFee.toString(), byteFee.toString());
  return { baseFee: BigNumber.from(baseFee.toString()), byteFee: BigNumber.from(byteFee.toString()) };
}

export async function setParams(priceOracle: string, params: Partial<{ serverPriceRate: BigNumberish; sizeLimit: BigNumberish; CRU_Native_RATE: number | string }>) {
  const [deployer] = await ethers.getSigners();
  const priceOracleImp = await ethers.getContractFactory("PriceOracle").then((fac) => fac.attach(priceOracle));
  // 10**9 picoCRU, 10**5 picoCRU, 15, 200*1024*1024 byte, 2000 * (10**5)(decimal 5) cru/native
  const { serverPriceRate = 15, sizeLimit = 200 * 1024 * 1024, CRU_Native_RATE = 5000 } = params;
  const { baseFee, byteFee } = await getCrustFileFee();
  // Set price
  await priceOracleImp
    .connect(deployer)
    .reInitialize(baseFee, byteFee, serverPriceRate, sizeLimit, parseUnits(`${CRU_Native_RATE}`, 5))
    .then((tx) => tx.wait(2));
  console.log(`Set basePrice: ${baseFee}, bytePrice: ${byteFee}, servicePriceRate:${serverPriceRate}%, sizeLimit:${sizeLimit}byte, CRU_Native_RATE: ${CRU_Native_RATE}"`);
}

export async function testPlaceOrder(storage: string) {
  const [deployer] = await ethers.getSigners();
  const storageFactory = await ethers.getContractFactory("StorageOrderCompatible");
  const storageImp = storageFactory.attach(storage).connect(deployer);
  const price = await storageImp.getPrice(5246268, false);
  console.log(`Price: ${ethers.utils.formatEther(price)} $ETH`);
  await storageImp
    .connect(deployer)
    .placeOrder("QmfH5zLmBtptUxRSGWazaumGwSsCW3n6P164eRXpbFatmJ", 5246268, false, { value: price })
    .then((tx) => tx.wait(2));
  console.log(`Placed order success`);
}

// getCrustFileFee()
