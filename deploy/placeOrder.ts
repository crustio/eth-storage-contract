import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Provider, Wallet } from "zksync-web3";

import * as config from "./config";
import { ethers } from "hardhat";

export default async function (hre: HardhatRuntimeEnvironment) {
  if (!config.SOCAddress) {
    console.error(`Please set ${config.SOCAddress} in .env file.`);
    process.exit(1);
  }

  const cid = "QmdNHZ15MkaYaEBAakPNwvEsV2ENepgZ4g9EsBQKLTURip"
  const fileSize = 684226;
  const isPermanent = false;
  console.log(`Place order with ${config.SOCName}(${config.SOCAddress})`);
  console.log(`Place order cid:${cid}, file size:${fileSize}, isPermanent:${isPermanent}...`);
    
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
  const price = await contract.getPrice(fileSize, isPermanent);
  console.log(`Price:${price}`);
  //const gasPrice = await zkWallet.provider.getGasPrice();
  //const gasPrice = await zkWallet.provider.getBlock('latest');
  //console.log(gasPrice.gasLimit.toNumber());
  const options = {
    //gasPrice: gasPrice,
    gasLimit: 3000000,
    value: price
  };
  const tx = await contract.placeOrder(cid, fileSize, isPermanent, options);
  await tx.wait();
}
