//SPDX-License-Identifier: UnLicensed
pragma solidity 0.6.6;
import '@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol';
import '@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol';
import '@uniswap/v2-periphery/contracts/libraries/UniswapV2Library.sol';

interface IERC20 {
    function allowance(address owner, address spender) external view returns (uint);
    function transfer(address _to, uint _value) external;
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function decimals() external view returns (uint);
}

contract StorageOrder {

    address internal constant UNISWAP_ROUTER_ADDRESS = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
    address internal constant CRU_ADDRESS = 0x32a7C02e79c4ea1008dD6564b35F131428673c41;
    address internal constant WETH_ADDRESS = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    IUniswapV2Router02 public uniswapRouter;
    IUniswapV2Factory public uniswapFactory;
    IERC20 public cruToken;
    address payable public owner;
    uint public basePrice;
    uint public bytePrice;
    uint public chainStatusPrice;
    mapping(address => bool) public tokens;
    mapping(address => bool) public nodes;
    address[] nodeArray;

    event Order(string cid, uint size, uint price, address nodeAddress);
    event OrderInERC20(string cid, uint size, uint price, address tokenAddress, address nodeAddress);

    constructor() public {
        owner = payable(msg.sender);
        uniswapRouter = IUniswapV2Router02(UNISWAP_ROUTER_ADDRESS);
        uniswapFactory = IUniswapV2Factory(uniswapRouter.factory());
        cruToken = IERC20(CRU_ADDRESS);
        tokens[CRU_ADDRESS] = true;
    }

    modifier onlyOwner {
        require(
            msg.sender == owner,
            "Only owner can call this function"
        );
        _;
    }

    function addSupportedToken(address tokenAddress) public onlyOwner {
        require(tokens[tokenAddress] == false, "Token already added");
        tokens[tokenAddress] = true;
    }

    function addOrderNode(address nodeAddress) public onlyOwner {
        require(nodes[nodeAddress] == false, "Node already added");
        nodes[nodeAddress] = true;
        nodeArray.push(nodeAddress);
    }

    function removeSupportedToken(address tokenAddress) public onlyOwner {
        require(tokens[tokenAddress], "Token not exist");
        delete tokens[tokenAddress];
    }
    
    function removeOrderNode(address nodeAddress) public onlyOwner {
        require(nodes[nodeAddress], "Node not exist");
        delete nodes[nodeAddress];
        for (uint i = 0; i < nodeArray.length; i++) {
            if (nodeArray[i] == nodeAddress) {
                delete nodeArray[i];
                break;
            }
        }
    }

    function setOrderPrice(uint basePrice_, uint bytePrice_, uint chainStatusPrice_) public onlyOwner {
        basePrice = basePrice_;
        bytePrice = bytePrice_;
        chainStatusPrice = chainStatusPrice_;
    }

    function getPrice(uint size) public view returns (uint price) {
        uint cruAmount = basePrice + size * bytePrice / (1024**2)  + chainStatusPrice;
        return getEstimated(cruAmount, WETH_ADDRESS);
    }

    function getPriceInERC20(address tokenAddress, uint size) public view returns (uint price) {
        require(tokens[tokenAddress], "Unsupported token");
        uint cruAmount = basePrice + size * bytePrice / (1024**2)  + chainStatusPrice;
        return getEstimated(cruAmount, tokenAddress);
    }

    function placeOrder(string memory cid, uint size) public payable {
        placeOrderWithNode(cid, size, getRandomNode(cid));
    }

    function placeOrderWithNode(string memory cid, uint size, address nodeAddress) public payable {
        require(nodes[nodeAddress], "Unsupported node");

        uint price = getPrice(size);
        require(msg.value >= price, "No enough ETH to place order");
        payable(nodeAddress).transfer(price);
        // Refund left ETH
        if (msg.value > price)
            payable(msg.sender).transfer(msg.value - price);
        emit Order(cid, size, price, nodeAddress);
    }

    function placeOrderInERC20(string memory cid, uint size, address tokenAddress) public {
        placeOrderInERC20WithNode(cid, size, tokenAddress, getRandomNode(cid));
    }

    function placeOrderInERC20WithNode(string memory cid, uint size, address tokenAddress, address nodeAddress) public {
        require(tokens[tokenAddress], "Unsupported token");
        require(nodes[nodeAddress], "Unsupported node");

        uint price = getPriceInERC20(tokenAddress, size);
        IERC20 token = IERC20(tokenAddress);
        require(token.allowance(msg.sender, address(this)) >= price, "No enough token approved");
        token.transferFrom(msg.sender, nodeAddress, price);

        emit OrderInERC20(cid, size, price, tokenAddress, nodeAddress);
    }

    function getEstimated(uint amount, address tokenAddress) internal view returns (uint) {
        (uint val0, bool success0) = getTokenInCRUDirectly(amount, tokenAddress);
        if (success0)
            return val0;

        (uint val1, bool success1) = getTokenInCRUIndirectly(amount, tokenAddress);
        require(success1, "Get price failed");
        return val1;
    }

    function getTokenInCRUDirectly(uint amount, address tokenAddress) internal view returns (uint val, bool success) {
        return getEstimatedTokenforCRU(amount, tokenAddress);
    }

    function getTokenInCRUIndirectly(uint amount, address tokenAddress) internal view returns (uint val, bool success) {
        (uint tokenAmount, bool success0) = getEstimatedETHforUnitToken(tokenAddress);
        require(success0, "Swap token price to ETH failed");
        (uint cruAmount, bool success1) = getEstimatedETHforUnitToken(CRU_ADDRESS);
        require(success1, "Swap CRU price to ETH failed");
        return (amount * cruAmount / tokenAmount, true);
    }

    function getEstimatedTokenforCRU(uint amount, address tokenAddress) internal view returns (uint val, bool success) {
        if (uniswapFactory.getPair(CRU_ADDRESS, tokenAddress) == address(0))
            return (0, false);

        (uint reserve1, uint reserve2) = UniswapV2Library.getReserves(uniswapRouter.factory(), tokenAddress, CRU_ADDRESS);
        IERC20 token1 = IERC20(tokenAddress);
        uint numerator = reserve1 * amount * 1000 * (10**(cruToken.decimals() - token1.decimals()));
        uint denominator = (reserve2 - amount) * 997;
        return ((numerator / denominator) + 1, true);
    }

    function getEstimatedETHforUnitToken(address tokenAddress) internal view returns (uint val, bool success) {
        (uint reserve1, uint reserve2) = UniswapV2Library.getReserves(uniswapRouter.factory(), uniswapRouter.WETH(), tokenAddress);
        IERC20 token1 = IERC20(uniswapRouter.WETH());
        IERC20 token2 = IERC20(tokenAddress);
        uint amount = 10**token2.decimals();
        uint numerator = reserve1 * amount * 1000 * (10**(token2.decimals() - token1.decimals()));
        uint denominator = (reserve2 - amount) * 997;
        return ((numerator / denominator) + 1, true);
    }

    function getRandomNode(string memory cid) internal view returns (address) {
        require(nodeArray.length > 0, "No node to choose");
        uint nodeID = uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, cid))) % nodeArray.length;
        return nodeArray[nodeID];
    }
}
