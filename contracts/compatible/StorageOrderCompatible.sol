//SPDX-License-Identifier: UnLicensed
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import "./IBlast.sol";
import "./IBlastPoints.sol";

interface IPriceOracle {
    function getPrice(uint size, bool isPermanent) external view returns (uint);
}

contract StorageOrderCompatible is Initializable, OwnableUpgradeable, UUPSUpgradeable {

    address public treasury;
    address public blast;
    address public blastPointsAddress;
    address public blastPointsOperator;

    mapping(address => bool) public nodes;
    address[] public nodeArray;
    IPriceOracle public priceOracle;
    bool private isPriceOracleSet;

    event Order(address customer, address merchant, string cid, uint size, uint price, bool isPermanent);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() initializer public {
        __Ownable_init();
        __UUPSUpgradeable_init();
        isPriceOracleSet = false;
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        onlyOwner
        override
    {}

    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Zero address detected");
        treasury = _treasury;
    }

    function setBlast(address _blast) external onlyOwner {
        require(_blast != address(0), "Zero address detected");
        blast = _blast;
        IBlast(blast).configureClaimableGas();
    }

    function setBlastPointsAddress(address _blastPointsAddress, address _blastPointsOperator) external onlyOwner {
        require(_blastPointsAddress != address(0) && _blastPointsOperator != address(0), "Zero address detected");
        blastPointsAddress = _blastPointsAddress;
        blastPointsOperator = _blastPointsOperator;
        IBlastPoints(blastPointsAddress).configurePointsOperator(blastPointsOperator);
    }

    function setPriceOracle(address priceOracleAddress) external onlyOwner {
        priceOracle = IPriceOracle(priceOracleAddress);
        isPriceOracleSet = true;
    }

    function addOrderNode(address nodeAddress) external onlyOwner {
        require(!isContract(nodeAddress), "Node address cannot be contract");
        require(nodes[nodeAddress] == false, "Node already added");
        nodes[nodeAddress] = true;
        nodeArray.push(nodeAddress);
    }

    function removeOrderNode(address nodeAddress) external onlyOwner {
        require(nodes[nodeAddress], "Node not exist");
        delete nodes[nodeAddress];
        uint len = nodeArray.length;
        for (uint i = 0; i < len; i++) {
            if (nodeArray[i] == nodeAddress) {
                nodeArray[i] = nodeArray[len-1];
                nodeArray.pop();
                break;
            }
        }
    }

    function getPrice(uint size, bool isPermanent) public view returns (uint) {
        require(isPriceOracleSet, "PriceOracle address is not set!");
        return priceOracle.getPrice(size, isPermanent);
    }

    function placeOrder(string memory cid, uint size, bool isPermanent) external payable {
        placeOrderWithNode(cid, size, getRandomNode(cid), isPermanent);
    }

    function placeOrderWithNode(string memory cid, uint size, address nodeAddress, bool isPermanent) public payable {
        require(nodes[nodeAddress], "Unsupported node");

        uint price = getPrice(size, isPermanent);
        require(msg.value >= price, "No enough balance to place order");

        (bool success,) = payable(nodeAddress).call{value:price}("");
        require(success, "Transfer payment failed");

        // Refund left fee
        if (msg.value > price)
            payable(msg.sender).transfer(msg.value - price);
        emit Order(msg.sender, nodeAddress, cid, size, price, isPermanent);

        if (blast != address(0) && treasury != address(0)) {
            (uint256 etherSeconds, uint256 etherBalance, ,) = IBlast(blast).readGasParams(address(this));
            if (etherSeconds > 0 && etherBalance > 0) {
                IBlast(blast).claimAllGas(address(this), treasury);
            }
        }
    }

    function getRandomNode(string memory cid) internal view returns (address) {
        require(nodeArray.length > 0, "No node to choose");
        uint nodeID = uint(keccak256(abi.encodePacked(block.prevrandao, block.timestamp, cid))) % nodeArray.length;
        return nodeArray[nodeID];
    }

    function getNodesNumber() external view returns (uint) {
        return nodeArray.length;
    }

    function isContract(address _addr) private view returns (bool) {
      uint32 size;
      assembly {
        size := extcodesize(_addr)
      }
      return (size > 0);
    }
}