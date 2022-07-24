const hre = require("hardhat");
const { currentTime, getEthBalance, fastForward } = require('./utils')();
const { assert } = require('./common');

describe("MGTNFT", async function () {
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

	it('test sell', async () => {
		const slot = 1;
		const startTime = await currentTime();
		const endTime = startTime + 2 * DAY;
		const price = 1;
		const amount = 100;
		const amountPerUser = 5;

		await mgt_nft.openSale(slot, startTime, endTime, price, amount, amountPerUser);

		await mgt_nft.setWhitelists([wl1.address], slot);

		// mint limit
		await assert.revert(mgt_nft.connect(wl2).mint(amountPerUser, { value: price * amountPerUser }), "Can not mint");
		await assert.revert(mgt_nft.connect(wl1).mint(amountPerUser, { value: price * amountPerUser - 1 }), "Insufficient value");
		await assert.revert(mgt_nft.connect(wl1).mint(amountPerUser + 1, { value: price * amountPerUser + 1 }), "Exceed");

		// normal mint
		await fastForward(DAY);
		await mgt_nft.connect(wl1).mint(amountPerUser - 1, { value: price * (amountPerUser - 1) })
		assert.equal(await mgt_nft.balanceOf(wl1.address), amountPerUser - 1);

		// mint time
		await fastForward(DAY * 2);
		await assert.revert(mgt_nft.connect(wl1).mint(1, { value: price }), "Wrong time");
	})

	/* ------------ tokenURI ------------ */

	it('test tokenURI: ', async () => {
		//	mint 300 nfts
		const slot = 1;
		const startTime = await currentTime();
		const endTime = startTime + 2 * DAY;
		const price = 1;
		const amount = 300;
		const amountPerUser = 300;
		await mgt_nft.openSale(slot, startTime, endTime, price, amount, amountPerUser);
		await mgt_nft.setWhitelists([wl1.address], slot);

		await fastForward(DAY);
		await mgt_nft.connect(wl1).mint(amountPerUser, { value: price * (amountPerUser) })


		// set five base URI
		/* 
		1. http://baseURI_01	0 - 50
		2. http://baseURI_02	51 - 151
		3. http://baseURI_03	152 - 199
		4. http://baseURI_04	200 - 240
		5. http://baseURI_05	241 - 299
		*/
		const baseURI01 = "http://baseURI_01/"
		const baseURI02 = "http://baseURI_02/"
		const baseURI03 = "http://baseURI_03/"
		const baseURI04 = "http://baseURI_04/"
		const baseURI05 = "http://baseURI_05/"
		await mgt_nft.setBaseURI(50, baseURI01);
		await mgt_nft.setBaseURI(151, baseURI02);
		await mgt_nft.setBaseURI(199, baseURI03);
		await mgt_nft.setBaseURI(240, baseURI04);
		await mgt_nft.setBaseURI(299, baseURI05);

		// get tokenURI
		assert.equal(await mgt_nft.tokenURI(0), baseURI01 + 0);
		assert.equal(await mgt_nft.tokenURI(50), baseURI01 + 50);
		assert.equal(await mgt_nft.tokenURI(25), baseURI01 + 25);
		assert.equal(await mgt_nft.tokenURI(51), baseURI02 + 51);
		assert.equal(await mgt_nft.tokenURI(151), baseURI02 + 151);
		assert.equal(await mgt_nft.tokenURI(125), baseURI02 + 125);
		assert.equal(await mgt_nft.tokenURI(152), baseURI03 + 152);
		assert.equal(await mgt_nft.tokenURI(199), baseURI03 + 199);
		assert.equal(await mgt_nft.tokenURI(180), baseURI03 + 180);
		assert.equal(await mgt_nft.tokenURI(200), baseURI04 + 200);
		assert.equal(await mgt_nft.tokenURI(240), baseURI04 + 240);
		assert.equal(await mgt_nft.tokenURI(225), baseURI04 + 225);
		assert.equal(await mgt_nft.tokenURI(241), baseURI05 + 241);
		assert.equal(await mgt_nft.tokenURI(299), baseURI05 + 299);
		assert.equal(await mgt_nft.tokenURI(275), baseURI05 + 275);
	})

	/* ------------ owner access right ------------ */

	it('set contract URI', async () => {
		const uri = "https://testURI/"
		await assert.revert(mgt_nft.connect(wl1).setContractURI(uri), "Ownable: caller is not the owner");
		await mgt_nft.connect(owner).setContractURI(uri);
		assert.equal(await mgt_nft.contractURI(), uri);
	})

	it('set blindbox URI', async () => {
		const uri = "https://testURI/"
		await assert.revert(mgt_nft.connect(wl1).setBlindBoxURI(uri), "Ownable: caller is not the owner");
		await mgt_nft.connect(owner).setBlindBoxURI(uri);
		assert.equal(await mgt_nft.blindBoxBaseURI(), uri);
	})

	it('set base URI', async () => {
		const uri = "https://testURI/";
		const stageID = 40;
		await assert.revert(mgt_nft.connect(wl1).setBaseURI(stageID, uri), "Ownable: caller is not the owner");
		await mgt_nft.connect(owner).setBaseURI(stageID, uri);
		assert.equal(await mgt_nft.stageIDs(0), stageID);
		assert.equal(await mgt_nft.revealedBaseURI(stageID), uri);
	})

	it('change base URI', async () => {
		const uri01 = "https://testURI/01";
		const uri02 = "https://testURI/02";
		const stageID = 40;
		await mgt_nft.connect(owner).setBaseURI(stageID, uri01);

		await assert.revert(mgt_nft.connect(wl1).changeURI(stageID, uri02), "Ownable: caller is not the owner");

		await mgt_nft.connect(owner).changeURI(stageID, uri02);
		assert.equal(await mgt_nft.revealedBaseURI(stageID), uri02);

		// change a not exist uri
		await assert.revert(mgt_nft.connect(owner).changeURI(stageID + 40, uri02), "URI corresponding to id should not be empty");
	})

	it('set whitelists', async () => {
		const whitelists = [wl1.address, wl2.address];
		const slot = 1;
		await assert.revert(mgt_nft.connect(wl1).setWhitelists(whitelists, slot), "Ownable: caller is not the owner");
		await mgt_nft.connect(owner).setWhitelists(whitelists, slot);

		assert.equal(await mgt_nft.whitelist(wl1.address), slot);
		assert.equal(await mgt_nft.whitelist(wl2.address), slot);
	})

	it('set project', async () => {
		const projectAddress = project.address;
		await assert.revert(mgt_nft.connect(wl1).setProject(projectAddress), "Ownable: caller is not the owner");
		await mgt_nft.connect(owner).setProject(projectAddress);

		assert.equal(await mgt_nft.project(), projectAddress);
	})

	it('set copyright', async () => {
		const copyrightAddress = copyright.address;
		await assert.revert(mgt_nft.connect(user).setCopyright(copyrightAddress), "Ownable: caller is not the owner");
		await mgt_nft.connect(owner).setCopyright(copyrightAddress);

		assert.equal(await mgt_nft.copyright(), copyrightAddress);
	})

	/* ------------ withdraw ------------ */

	it('withdraw test', async () => {
		// mint
		const slot = 1;
		const startTime = await currentTime();
		const endTime = startTime + 2 * DAY;
		const price = 1;
		const amount = 100;
		const amountPerUser = 5;

		await mgt_nft.openSale(slot, startTime, endTime, price, amount, amountPerUser);
		await mgt_nft.setWhitelists([wl1.address], slot);
		// normal mint
		await fastForward(DAY);
		await mgt_nft.connect(wl1).mint(amountPerUser, { value: price * amountPerUser })

		assert.equal(await getEthBalance(mgt_nft.address), price * amountPerUser);

		//	wrong caller
		await assert.revert(mgt_nft.connect(wl1).withdraw(), "have no rights do this");

		await mgt_nft.connect(project).withdraw()
		await mgt_nft.connect(copyright).withdraw()
	})
})
