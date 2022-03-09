//SPDX-License-Identifier: Unlicense
pragma solidity 0.6.6;
import '@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol';
import '@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol';
import '@uniswap/v2-periphery/contracts/libraries/UniswapV2Library.sol';

interface IToken {
    //function balanceOf(address _owner) external view returns(uint);
    function transfer(address _to, uint _value) external;
    //event Transfer(address indexed _from, address indexed _to, uint _value);
}

contract StorageOrder {

    address internal constant UNISWAP_ROUTER_ADDRESS = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
    address internal constant UNISWAP_FACTORY_ADDRESS = 0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f;
    address internal constant CRU_ADDRESS = 0x32a7C02e79c4ea1008dD6564b35F131428673c41;
    IUniswapV2Router02 public uniswapRouter;
    IUniswapV2Factory public uniswapFactory;
    address payable public owner;
    uint public basePrice;
    uint public bytePrice;
    mapping(address => bool) public tokens;
    mapping(address => bool) public nodes;

    event Order(string cid, uint size, uint price, address tokenAddress);
    event OrderWithNode(string cid, uint size, uint price, address tokenAddress, address nodeAddress);

    constructor() public {
        owner = payable(msg.sender);
        uniswapRouter = IUniswapV2Router02(UNISWAP_ROUTER_ADDRESS);
        uniswapFactory = IUniswapV2Factory(UNISWAP_FACTORY_ADDRESS);
    }

    modifier onlyOwner {
        require(
            msg.sender == owner,
            "Only owner can call this function."
        );
        _;
    }

    function addSupportedToken(address tokenAddress) public onlyOwner {
        require(tokens[tokenAddress] == false, "Token already added.");
        tokens[tokenAddress] = true;
    }

    function addOrderNode(address nodeAddress) public onlyOwner {
        require(nodes[nodeAddress] == false, "Node already added.");
        nodes[nodeAddress] = true;
    }

    function setOrderPrice(uint basePrice_, uint bytePrice_) public onlyOwner {
        basePrice = basePrice_;
        bytePrice = bytePrice_;
    }

    function getPriceInToken(address tokenAddress, uint size) public view returns (uint price) {
        require(tokens[tokenAddress], "Unsupported token.");
        uint cruAmount = basePrice + size * bytePrice;
        return getEstimated(cruAmount, tokenAddress);
    }

    function placeOrder(string calldata cid, uint size, address tokenAddress) external {
        require(tokens[tokenAddress], "Unsupported token.");

        uint price = getPriceInToken(tokenAddress, size);

        IToken token = IToken(tokenAddress);
        token.transfer(owner, price);

        emit Order(cid, size, price, tokenAddress);
    }

    function placeOrderWithNode(string calldata cid, uint size, address tokenAddress, address nodeAddress) external {
        require(tokens[tokenAddress], "Unsupported token.");

        require(nodes[nodeAddress], "Unsupported node.");

        uint price = getPriceInToken(tokenAddress, size);
        IToken token = IToken(tokenAddress);
        token.transfer(nodeAddress, price);
        emit OrderWithNode(cid, size, price, tokenAddress, nodeAddress);
    }

    function getEstimated(uint amount, address tokenAddress) public view returns (uint) {
        (uint val0, bool success0) = getTokenInCRUDirectly(amount, tokenAddress);
        if (success0)
            return val0;

        (uint val1, bool success1) = getTokenInCRUIndirectly(amount, tokenAddress);
        require(success1, "Cannot get price.");
        return val1;
    }

    function getTokenInCRUDirectly(uint amount, address tokenAddress) public view returns (uint val, bool success) {
        return getEstimatedTokenforCRU(amount, tokenAddress);
    }

    function getTokenInCRUIndirectly(uint amount, address tokenAddress) public view returns (uint val, bool success) {
        (uint tokenAmount, bool success0) = getEstimatedETHforToken(1, tokenAddress);
        require(success0, "Swap token price to ETH failed.");
        (uint cruAmount, bool success1) = getEstimatedETHforToken(1, CRU_ADDRESS);
        require(success1, "Swap CRU price to ETH failed.");
        return (amount * cruAmount / tokenAmount, true);
    }

    function getEstimatedTokenforCRU(uint amount, address tokenAddress) public view returns (uint val, bool success) {
        if (uniswapFactory.getPair(CRU_ADDRESS, tokenAddress) == address(0))
            return (0, false);

        (uint reserve1, uint reserve2) = UniswapV2Library.getReserves(uniswapRouter.factory(), tokenAddress, CRU_ADDRESS);
        uint numerator = reserve1 * amount * 1000 * 10 ** 12;
        uint denominator = (reserve2 - amount) * 997;
        return ((numerator / denominator) + 1, true);
    }

    function getEstimatedETHforToken(uint amount, address tokenAddress) public view returns (uint val, bool success) {
        (uint reserve1, uint reserve2) = UniswapV2Library.getReserves(uniswapRouter.factory(), uniswapRouter.WETH(), tokenAddress);
        uint nAmount = amount * 10 ** 18;
        uint numerator = reserve1 * nAmount * 1000;
        uint denominator = (reserve2 - nAmount) * 997;
        uint amountIn = (numerator / denominator) + 1;
        return (amountIn, true);
    }
}
