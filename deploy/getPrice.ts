import { Wallet, Provider, utils } from "zksync-web3";
import { Deployer, ZkSyncArtifact } from "@matterlabs/hardhat-zksync-deploy";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import * as hre from "hardhat";
import * as config from "./config";

export default async function (hre: HardhatRuntimeEnvironment) {
  if (!config.SOCAddress) {
    console.error(`Please set ${config.SOCAddress} in .env file.`);
    process.exit(1);
  }

  console.log(`Get price from ${config.SOCName}(${config.SOCAddress})...`);
    
  // mnemonic for local node rich wallet
  //const testMnemonic = 'stuff slice staff easily soup parent arm payment cotton trade scatter struggle';
  //const zkWallet = Wallet.fromMnemonic(testMnemonic, "m/44'/60'/0'/0/0");
  const zkSyncProvider = new Provider(config.zkSyncRPC);
  const ethereumProvider = ethers.getDefaultProvider(config.zkSyncNetwork);
  const zkWallet = new Wallet(config.zkSyncAccountPRV, zkSyncProvider, ethereumProvider);
  const deployer = new Deployer(hre, zkWallet);
  const artifact = await deployer.loadArtifact(config.SOCName);

  const contract = new ethers.Contract(
    config.SOCAddress,
    artifact.abi,
    zkWallet
  );

  contract.connect(zkWallet);
  const fileSize = 1024**2;
  const isPermanent = true;
  const value = await contract.getPrice(fileSize, isPermanent);
  console.log(`file size:${fileSize}, isPermanent:${isPermanent} => price:${value}`)
}
