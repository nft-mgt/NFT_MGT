// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract MGTNFT is ERC721, Ownable {
    using Strings for uint256;

    //  receive ETH
    address public copyright;
    address public project;

    //  WL
    mapping(address => uint8) public whitelist;
    mapping(address => mapping(uint64 => uint64)) minted;
    uint64 public startTime;
    uint64 public endTime = type(uint64).max;
    uint64 public slot = type(uint8).max;
    uint64 amountPerUser;
    uint256 public price;

    uint64 public immutable maxSupply = 1800;
    uint64 public saleAmount;
    uint64 public totalSupply;

    // reveal
    string private baseURI;
    string private blindBoxURI;
    uint256 public revealedID;

    constructor(
        string memory _name,
        string memory _symbol,
        address _project,
        address _copyright
    ) ERC721(_name, _symbol) {
        project = _project;
        copyright = _copyright;
    }

    event BlindBoxOpen(uint256 tokenId);

    receive() external payable {}

    /* --------------- ETH receiver --------------- */

    function setProject(address _project) public onlyOwner {
        project = _project;
    }

    function setCopyright(address _copyright) public onlyOwner {
        copyright = _copyright;
    }

    function withdraw() public {
        require(msg.sender == copyright || msg.sender == project);
        require(address(this).balance != 0);
        uint256 projects = (address(this).balance * 60) / 100;
        payable(copyright).transfer(address(this).balance - projects);
        payable(project).transfer(projects);
    }

    /* --------------- sale --------------- */

    function openSale(
        uint8 _slot,
        uint64 _startTime,
        uint64 _endTime,
        uint256 _price,
        uint64 amount,
        uint64 _amountPerUser
    ) public onlyOwner {
        slot = _slot;
        startTime = _startTime;
        endTime = _endTime;
        price = _price;
        saleAmount = totalSupply + amount;
        amountPerUser = _amountPerUser;
    }

    function setWhitelists(address[] memory wls, uint8 _slot) public onlyOwner {
        for (uint256 i = 0; i < wls.length; i++) {
            whitelist[wls[i]] = _slot;
        }
    }

    function mint(uint64 amount) external payable callerIsUser {
        require(whitelist[msg.sender] == slot, "Can not mint");
        require(
            block.timestamp <= endTime && block.timestamp >= startTime,
            "Wrong time"
        );
        require(msg.value >= price * amount, "Insufficient value");
        require(minted[msg.sender][slot] + amount <= amountPerUser, "Exceed");

        minted[msg.sender][slot] += amount;
        for (uint64 i = 0; i < amount; i++) {
            _safeMint(msg.sender, totalSupply);
        }
    }

    /* --------------- reveal --------------- */

    function setRevealedID(uint256 _revealedID) public onlyOwner {
        revealedID = _revealedID;
        emit BlindBoxOpen(0);
    }

    function setBaseTokenURI(string memory _uri) public onlyOwner {
        baseURI = _uri;
    }

    function setBlindBoxURI(string memory _blindBoxURI)
        public
        onlyOwner
    {
        blindBoxURI = _blindBoxURI;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        require(
            _exists(tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );

        string memory baseURI_ = _baseURI();
        return
            bytes(baseURI_).length > 0 && tokenId <= revealedID
                ? string(abi.encodePacked(baseURI_, tokenId.toString()))
                : blindBoxURI;
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override {
        if (from == address(0)) {
            totalSupply++;
            require(totalSupply <= maxSupply, "suit sold out");
        }
    }

    modifier callerIsUser() {
        require(tx.origin == msg.sender, "The caller is another contract");
        _;
    }
}
