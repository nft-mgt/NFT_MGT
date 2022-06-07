const { expect } = require("chai");
const { ethers } = require("hardhat");
const { currentTime, toUnit, fastForward } = require('./utils')();
const { assert } = require('./common');

describe("GameLoot", async function () {
	let mgt_nft;

	let owner, copyright, project, wl1, wl2, user;

	/* --------- constructor args --------- */
	const symbol = "MGT";
	const name = "MGT_NFT";
	const DAY = 86400;

	beforeEach(async function () {
		[owner, copyright, project, wl1, wl2, user] = await hre.ethers.getSigners();

		// mgt_nft
		const MGTNFT = await hre.ethers.getContractFactory("MGTNFT");
		mgt_nft = await MGTNFT.deploy(name, symbol, project.address, copyright.address);
		await mgt_nft.deployed();
	});

	it('constructor should be success: ', async () => {
		assert.equal(await mgt_nft.name(), name);
		assert.equal(await mgt_nft.symbol(), symbol);
		assert.equal(await mgt_nft.copyright(), copyright.address);
		assert.equal(await mgt_nft.project(), project.address);
	});

	it('test sell: ', async () => {
		const slot = 1;
		const startTime = await currentTime();
		const endTime = startTime + 2 * DAY;
		const price = 1;
		const amount = 100;
		const amountPerUser = 5;

		await mgt_nft.openSale(slot, startTime, endTime, price, amount, amountPerUser);

		await mgt_nft.setWhitelists([wl1.address],slot);

		// mint limit
		await assert.revert(mgt_nft.connect(wl2).mint(amountPerUser,{value:price * amountPerUser}), "Can not mint");
		await assert.revert(mgt_nft.connect(wl1).mint(amountPerUser,{value:price * amountPerUser - 1}), "Insufficient value");
		await assert.revert(mgt_nft.connect(wl1).mint(amountPerUser + 1,{value:price * amountPerUser + 1}), "Exceed");

		// normal mint
		await fastForward(DAY);
		await mgt_nft.connect(wl1).mint(amountPerUser - 1,{value:price * (amountPerUser - 1)})
		assert.equal(await mgt_nft.balanceOf(wl1.address), amountPerUser - 1);

		// mint time
		await fastForward(DAY * 2);
		await assert.revert(mgt_nft.connect(wl1).mint(1,{value:price}), "Wrong time");
	})

	/* ------------ tokenURI ------------ */

	// TODO
	it('test tokenURI: ', async () => {
		//	mint 300 nfts

		// set five base URI
		/* 
		1. http://baseURI_01	0 - 50
		2. http://baseURI_02	51 - 151
		3. http://baseURI_03	152 - 199
		4. http://baseURI_04	200 - 240
		5. http://baseURI_05	241 - 299
		*/

		// get tokenURI

			
	})




})
