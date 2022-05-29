# Storage Order

StorageOrder contract allows users to place a storage order on ethereum with ETH or other supported ERC20 tokens.

## Local Development

### Install dependencies

```
yarn
```

### Test

TestContracts.sol is a test file which contains MINEToken and TokenLiquidity contracts. These two contracts are used to test ERC20 tokens related operations.

### Commands

Use hardhat tool kits to manager this project.

```shell
// List all accounts
npx hardhat accounts
// Compile contract
npx hardhat compile
// Clean project
npx hardhat clean
// Run test cases in test
npx hardhat test
// Start a local network
npx hardhat node
// Run scripts on local network
npx hardhat run scripts/deploy.js --network localhost
// Show help information
npx hardhat help
```

For more information about hardhat, please refer to [hardhat doc](https://hardhat.org/getting-started/)

### Usage

Functions for contract owner:
1. **addSupportedToken**: Add supported token.
1. **addOrderNode**: Add order node which will order and pin files.
1. **removeSupportedToken**: Remove supported token.
1. **removeOrderNode**: Remove order node.
1. **setOrderPrice**: Set price.
1. **setServicePriceRate**: Set price rate which indicates service price rate.
1. **setSizeLimit**: Set size limit.

Functions for users:
1. **getPrice**: Get price in ETH for file size specified by parameter "size".
1. **getPriceInERC20**: Get price in ERC20 specified by "tokenAddress" for file size specified by "size"
1. **placeOrder**: Place order with cid and size in ETH, msg.value indicates the price user should pay for pinning node.
1. **placeOrderWithNode**: Same like placeOrder, the difference is that the pinning node is fixed by nodeAddress.
1. **placeOrderInERC20**: Place order with cid and size in ERC20 specified by tokenAddress.
1. **placeOrderInERC20WithNode**: Same like placeOrderInERC20, the difference is that the pinning node is fixed by nodeAddress.

js examples:
```shell
// Place order in ETH, you can get the storageOrder contract instance by ethers.js or web3.js as you like
// For more information please refer to allow "https://docs.ethers.io/v5/" and "https://web3js.readthedocs.io/en/v1.7.3/"
const fileCid = "QmfH5zLmBtptUxRSGWazaumGwSsCW3n6P164eRXpbFatmJ";
const fileSize = 5246268;
// Firstly get price in ETH with file size
const price = await storageOrder.getPrice(fileSize);
// Secondly placeOrder with cid, size and price 
await storageOrder.placeOrder(fileCid, fileSize, {value: price})

// Place order in ERC20
// Firstly get price with ERC20TokenAddress and file size
const price = await storageOrder.getPriceInERC20(ERC20TokenAddress, fileSize);
// Secondly invoke ERC20Token contract function "approve" to assign storageOrder contract the right to use amount of ERC20 tokens by price
ERC20Token.approve(storageOrder.address, price);
// Thirdly place order with cid, size and ERC20TokenAddress
await storageOrder.placeOrderInERC20(fileCid, fileSize, ERC20TokenAddress)
```
