const { ethers } = require("hardhat");
const hre = require("hardhat");
const { currentTime, getEthBalance, fastForward } = require('./utils')();
const { assert } = require('./common');

describe("MGTNFT", async function () {
    let mgt_nft;

    let owner, copyright, project, wl1, wl2, wl3, wl4, wl5, wl6, wl7, wl8, wl9, wl10, wl11, wl12, wl13, wl14, wl15, wl16, wl17;

    /* --------- constructor args --------- */
    const symbol = "JAV";
    const name = "JAPAN ADULT TOKEN - Minario";
    const DAY = 86400;
    const HOUR = 3600;

    beforeEach(async function () {
        [owner, copyright, project, wl1, wl2, wl3, wl4, wl5, wl6, wl7, wl8, wl9, wl10, wl11, wl12, wl13, wl14, wl15, wl16, wl17, wl18] = await hre.ethers.getSigners();

        // mgt_nft
        const MGTNFT = await hre.ethers.getContractFactory("MGTNFT");
        mgt_nft = await hre.upgrades.deployProxy(MGTNFT, [name, symbol, project.address, copyright.address]);
        await mgt_nft.deployed();
    });

    it('constructor should be success: ', async () => {
        assert.equal(await mgt_nft.name(), name);
        assert.equal(await mgt_nft.symbol(), symbol);
        assert.equal(await mgt_nft.copyright(), copyright.address);
        assert.equal(await mgt_nft.project(), project.address);
        await assert.revert(
            mgt_nft.initialize(name, symbol, project.address, copyright.address),
            "Initializable: contract is already initialized");
    });

    /* ------------ owner set batch config ------------ */
    it('setBatchConfig test: ', async () => {
        const batchIndex = 1;

        const startID = 0;
        const endID = 0;
        const price = 1;
        const startTime = 1000;
        const endTime = 2000;
        const amountPerUser = 5;
        const forPublic = false;
        const config = [startID, endID, price, startTime, endTime, amountPerUser, forPublic];

        await assert.revert(mgt_nft.connect(wl1).setBatchConfig(config, batchIndex), "Ownable: caller is not the owner");

        await mgt_nft.connect(owner).setBatchConfig(config, batchIndex);
        // console.log(await mgt_nft.batchConfigs(batchIndex));
        assert.equal(await mgt_nft.batchCurrentTokenID(batchIndex), startID);
    });

    it('setBatchPrice test', async () => {
        const batchIndex = 1;

        const startID = 0;
        const endID = 0;
        const price = 1;
        const startTime = 1000;
        const endTime = 2000;
        const amountPerUser = 5;
        const forPublic = false;
        const config = [startID, endID, price, startTime, endTime, amountPerUser, forPublic]; await mgt_nft.connect(owner).setBatchConfig(config, batchIndex);

        const newPrice = 2;
        await assert.revert(mgt_nft.connect(wl1).setBatchPrice(newPrice, batchIndex), "Ownable: caller is not the owner");

        await mgt_nft.connect(owner).setBatchPrice(newPrice, batchIndex);
        const batchConfig = await mgt_nft.batchConfigs(batchIndex);
        assert.equal(batchConfig.price.toNumber(), newPrice);
    });

    it('setBatchStartAndEndID test: ', async () => {
        const batchIndex = 1;

        const startID = 0;
        const endID = 0;
        const price = 1;
        const startTime = 1000;
        const endTime = 2000;
        const amountPerUser = 5;
        const forPublic = false;
        const config = [startID, endID, price, startTime, endTime, amountPerUser, forPublic]; await mgt_nft.connect(owner).setBatchConfig(config, batchIndex);

        const newStartID = 2;
        const newEndID = 5;
        await assert.revert(mgt_nft.connect(wl1).setBatchStartAndEndID(newStartID, newEndID, batchIndex), "Ownable: caller is not the owner");
        await assert.revert(mgt_nft.connect(owner).setBatchStartAndEndID(newStartID, newStartID - 1, batchIndex), "startID must be smaller then endID");
        await mgt_nft.connect(owner).setBatchStartAndEndID(newStartID, newEndID, batchIndex);

        const batchConfig = await mgt_nft.batchConfigs(batchIndex);
        assert.equal(batchConfig.startID.toNumber(), newStartID);
        assert.equal(batchConfig.endID.toNumber(), newEndID);
    });

    it('setBatchStartAndEndTime test: ', async () => {
        const batchIndex = 1;

        const startID = 0;
        const endID = 0;
        const price = 1;
        const startTime = 1000;
        const endTime = 2000;
        const amountPerUser = 5;
        const forPublic = false;
        const config = [startID, endID, price, startTime, endTime, amountPerUser, forPublic]; await mgt_nft.connect(owner).setBatchConfig(config, batchIndex);

        const newStartTime = 3000;
        const newEndTime = 4000;
        await assert.revert(mgt_nft.connect(wl1).setBatchStartAndEndTime(newStartTime, newEndTime, batchIndex), "Ownable: caller is not the owner");
        await assert.revert(mgt_nft.connect(owner).setBatchStartAndEndTime(newStartTime, newStartTime, batchIndex), "startTime must be smaller then endTime");

        await mgt_nft.connect(owner).setBatchStartAndEndTime(newStartTime, newEndTime, batchIndex);

        const batchConfig = await mgt_nft.batchConfigs(batchIndex);
        assert.equal(batchConfig.startTime.toNumber(), newStartTime);
        assert.equal(batchConfig.endTime.toNumber(), newEndTime);
    });

    it('setBatchAmountPerUser test: ', async () => {
        const batchIndex = 1;

        const startID = 0;
        const endID = 1;
        const price = 1;
        const startTime = 1000;
        const endTime = 2000;
        const amountPerUser = 5;
        const forPublic = false;
        const config = [startID, endID, price, startTime, endTime, amountPerUser, forPublic]; await mgt_nft.connect(owner).setBatchConfig(config, batchIndex);

        const newAmountPerUser = 10;
        await assert.revert(mgt_nft.connect(wl1).setBatchAmountPerUser(newAmountPerUser, batchIndex), "Ownable: caller is not the owner");
        await mgt_nft.connect(owner).setBatchAmountPerUser(newAmountPerUser, batchIndex);

        const batchConfig = await mgt_nft.batchConfigs(batchIndex);
        assert.equal(batchConfig.amountPerUser.toNumber(), newAmountPerUser);
    });

    it('setBatchForPublic test: ', async () => {
        const batchIndex = 1;

        const startID = 0;
        const endID = 1;
        const price = 1;
        const startTime = 1000;
        const endTime = 2000;
        const amountPerUser = 5;
        const forPublic = false;
        const config = [startID, endID, price, startTime, endTime, amountPerUser, forPublic];
        await mgt_nft.connect(owner).setBatchConfig(config, batchIndex);

        const newForPublic = true;
        await assert.revert(mgt_nft.connect(wl1).setBatchForPublic(newForPublic, batchIndex), "Ownable: caller is not the owner");
        await mgt_nft.connect(owner).setBatchForPublic(newForPublic, batchIndex);

        const batchConfig = await mgt_nft.batchConfigs(batchIndex);
        assert.equal(batchConfig.forPublic, newForPublic);
    });

    it('setBatchWhitelist test: ', async () => {
        const batchIndex = 1;
        const wls = [wl1.address, wl2.address];
        await assert.revert(mgt_nft.connect(wl1).setBatchWhitelist(wls, batchIndex), "Ownable: caller is not the owner");
        await mgt_nft.connect(owner).setBatchWhitelist(wls, batchIndex);

        assert.equal(await mgt_nft.whitelist(batchIndex, wl1.address), true);
        assert.equal(await mgt_nft.whitelist(batchIndex, wl2.address), true);
    });

    /* ------------ mint ------------ */

    it('mint test: ', async () => {
        // set config
        const batchIndex = 1;
        const startID = 0;
        const endID = 10;
        const price = 1;
        const startTime = await currentTime();
        const endTime = startTime + DAY;
        const amountPerUser = 5;
        const forPublic = false;
        const config = [startID, endID, price, startTime, endTime, amountPerUser, forPublic];
        await mgt_nft.connect(owner).setBatchConfig(config, batchIndex);

        // Is not whitelist
        await assert.revert(mgt_nft.connect(wl1).mint(amountPerUser, batchIndex, { value: price * amountPerUser }), "Is not whitelist");

        // set whitelist
        const wls = [wl1.address, wl2.address];
        await mgt_nft.connect(owner).setBatchWhitelist(wls, batchIndex);

        // Wrong time
        await fastForward(DAY * 2);
        await assert.revert(mgt_nft.connect(wl1).mint(amountPerUser, batchIndex, { value: price * amountPerUser }), "Wrong time");

        // Insufficient value
        const newBatchIndex = batchIndex + 1;
        config[3] = await currentTime();
        config[4] = config[3] + DAY;
        await mgt_nft.connect(owner).setBatchConfig(config, newBatchIndex);
        await mgt_nft.connect(owner).setBatchWhitelist(wls, newBatchIndex);
        await assert.revert(mgt_nft.connect(wl1).mint(amountPerUser, newBatchIndex, { value: price * amountPerUser - 1 }), "Insufficient value");

        // mint
        await mgt_nft.connect(wl1).mint(amountPerUser, newBatchIndex, { value: price * amountPerUser });

        // check state
        assert.equal(await mgt_nft.batchCurrentTokenID(newBatchIndex), amountPerUser);
        assert.equal(await mgt_nft.minted(wl1.address, newBatchIndex), amountPerUser);
    });

    it('The whole process test: ', async () => {
        /* 
        - all 21 rounds
        */
        const startTime1 = await currentTime();
        const endTime1 = startTime1 + HOUR * 9;
        const startTime2 = endTime1;
        const endTime2 = startTime2 + HOUR * 3;
        const startTime3 = endTime2;
        const endTime3 = startTime3 + HOUR * 3;
        const startTime4 = endTime3;
        const endTime4 = startTime4 + HOUR * 3;
        const startTime5 = endTime4;
        const endTime5 = startTime5 + HOUR * 15;
        const startTime6 = endTime5;
        const endTime6 = startTime6 + HOUR * 9;
        const startTime7 = endTime6;
        const endTime7 = startTime7 + HOUR * 6;

        const startTime1_2 = endTime7;
        const endTime1_2 = startTime1_2 + HOUR * 9;
        const startTime2_2 = endTime1_2;
        const endTime2_2 = startTime2_2 + HOUR * 3;
        const startTime3_2 = endTime2_2;
        const endTime3_2 = startTime3_2 + HOUR * 3;
        const startTime4_2 = endTime3_2;
        const endTime4_2 = startTime4_2 + HOUR * 3;
        const startTime5_2 = endTime4_2;
        const endTime5_2 = startTime5_2 + HOUR * 15;
        const startTime6_2 = endTime5_2;
        const endTime6_2 = startTime6_2 + HOUR * 9;
        const startTime7_2 = endTime6_2;
        const endTime7_2 = startTime7_2 + HOUR * 6;

        const startTime1_3 = endTime7_2;
        const endTime1_3 = startTime1_3 + HOUR * 9;
        const startTime2_3 = endTime1_3;
        const endTime2_3 = startTime2_3 + HOUR * 3;
        const startTime3_3 = endTime2_3;
        const endTime3_3 = startTime3_3 + HOUR * 3;
        const startTime4_3 = endTime3_3;
        const endTime4_3 = startTime4_3 + HOUR * 3;
        const startTime5_3 = endTime4_3;
        const endTime5_3 = startTime5_3 + HOUR * 15;
        const startTime6_3 = endTime5_3;
        const endTime6_3 = startTime6_3 + HOUR * 9;
        const startTime7_3 = endTime6_3;
        const endTime7_3 = startTime7_3 + DAY;

        // 2
        const config1 = [0, 1, 1, startTime1, endTime1, 1, false];
        // 2
        const config2 = [2, 5, 1, startTime2, endTime2, 2, false];
        // 5
        const config3 = [6, 15, 1, startTime3, endTime3, 2, false];
        // 4
        const config4 = [16, 27, 1, startTime4, endTime4, 3, false];
        // 11
        const config5 = [28, 182, 1, startTime5, endTime5, 15, false];
        // 18
        const config6 = [183, 254, 1, startTime6, endTime6, 4, false];
        // 9
        const config7 = [255, 299, 1, startTime7, endTime7, 5, false];

        const bathIndex1 = 1;
        const bathIndex2 = 2;
        const bathIndex3 = 3;
        const bathIndex4 = 4;
        const bathIndex5 = 5;
        const bathIndex6 = 6;
        const bathIndex7 = 7;

        // set whitelist for all batches
        await mgt_nft.setBatchWhitelist([wl1.address, wl2.address], bathIndex1);
        await mgt_nft.setBatchWhitelist([wl1.address, wl2.address], bathIndex2);
        await mgt_nft.setBatchWhitelist([wl1.address, wl2.address, wl3.address, wl4.address, wl5.address], bathIndex3);
        await mgt_nft.setBatchWhitelist([wl1.address, wl2.address, wl3.address, wl4.address], bathIndex4);
        await mgt_nft.setBatchWhitelist([wl1.address, wl2.address, wl3.address, wl4.address, wl5.address, wl6.address, wl7.address, wl8.address, wl9.address, wl10.address, wl11.address], bathIndex5);
        await mgt_nft.setBatchWhitelist([wl1.address, wl2.address, wl3.address, wl4.address, wl5.address, wl6.address, wl7.address, wl8.address, wl9.address, wl10.address, wl11.address, wl12.address, wl13.address, wl14.address, wl15.address, wl16.address, wl17.address], bathIndex6);
        await mgt_nft.setBatchWhitelist([wl1.address, wl2.address, wl3.address, wl4.address, wl5.address, wl6.address, wl7.address, wl8.address, wl9.address], bathIndex7);

        // set config for all batches
        await mgt_nft.setBatchConfig(config1, bathIndex1);
        await mgt_nft.setBatchConfig(config2, bathIndex2);
        await mgt_nft.setBatchConfig(config3, bathIndex3);
        await mgt_nft.setBatchConfig(config4, bathIndex4);
        await mgt_nft.setBatchConfig(config5, bathIndex5);
        await mgt_nft.setBatchConfig(config6, bathIndex6);
        await mgt_nft.setBatchConfig(config7, bathIndex7);

        // batch 1
        await mgt_nft.connect(wl1).mint(1, bathIndex1, { value: 1 });
        // batch 2
        await fastForward(HOUR * 9)
        await mgt_nft.connect(wl1).mint(2, bathIndex2, { value: 2 });
        // batch 3
        await fastForward(HOUR * 3)
        await mgt_nft.connect(wl1).mint(2, bathIndex3, { value: 2 });
        await mgt_nft.connect(wl2).mint(2, bathIndex3, { value: 2 });
        // batch 4
        await fastForward(HOUR * 3)
        await mgt_nft.connect(wl1).mint(3, bathIndex4, { value: 3 });
        await mgt_nft.connect(wl2).mint(3, bathIndex4, { value: 3 });
        // batch 5
        await fastForward(HOUR * 3)
        await mgt_nft.connect(wl1).mint(15, bathIndex5, { value: 15 });
        await mgt_nft.connect(wl2).mint(15, bathIndex5, { value: 15 });
        // batch 6
        await fastForward(HOUR * 15)
        await mgt_nft.connect(wl1).mint(4, bathIndex6, { value: 4 });
        await mgt_nft.connect(wl2).mint(4, bathIndex6, { value: 4 });
        await mgt_nft.connect(wl3).mint(4, bathIndex6, { value: 4 });
        await mgt_nft.connect(wl4).mint(4, bathIndex6, { value: 4 });
        await mgt_nft.connect(wl5).mint(4, bathIndex6, { value: 4 });
        await mgt_nft.connect(wl6).mint(4, bathIndex6, { value: 4 });
        // batch 7
        await fastForward(HOUR * 9)
        await mgt_nft.connect(wl1).mint(5, bathIndex7, { value: 5 });
        await mgt_nft.connect(wl2).mint(5, bathIndex7, { value: 5 });
        await mgt_nft.connect(wl3).mint(5, bathIndex7, { value: 5 });

        // set round 2 time
        await mgt_nft.connect(owner).setBatchStartAndEndTime(startTime1_2, endTime1_2, bathIndex1);
        await mgt_nft.connect(owner).setBatchStartAndEndTime(startTime2_2, endTime2_2, bathIndex2);
        await mgt_nft.connect(owner).setBatchStartAndEndTime(startTime3_2, endTime3_2, bathIndex3);
        await mgt_nft.connect(owner).setBatchStartAndEndTime(startTime4_2, endTime4_2, bathIndex4);
        await mgt_nft.connect(owner).setBatchStartAndEndTime(startTime5_2, endTime5_2, bathIndex5);
        await mgt_nft.connect(owner).setBatchStartAndEndTime(startTime6_2, endTime6_2, bathIndex6);
        await mgt_nft.connect(owner).setBatchStartAndEndTime(startTime7_2, endTime7_2, bathIndex7);

        // batch 8
        await fastForward(HOUR * 6)
        await mgt_nft.connect(wl2).mint(1, bathIndex1, { value: 1 });
        // batch 9
        await fastForward(HOUR * 9)
        await mgt_nft.connect(wl2).mint(2, bathIndex2, { value: 2 });
        // batch 10
        await fastForward(HOUR * 3)
        await mgt_nft.connect(wl3).mint(2, bathIndex3, { value: 2 });
        await mgt_nft.connect(wl4).mint(2, bathIndex3, { value: 2 });
        // batch 11
        await fastForward(HOUR * 3)
        await mgt_nft.connect(wl3).mint(3, bathIndex4, { value: 3 });
        // batch 12
        await fastForward(HOUR * 3)
        await mgt_nft.connect(wl3).mint(15, bathIndex5, { value: 15 });
        await mgt_nft.connect(wl4).mint(15, bathIndex5, { value: 15 });
        await mgt_nft.connect(wl5).mint(15, bathIndex5, { value: 15 });
        // batch 13
        await fastForward(HOUR * 15)
        await mgt_nft.connect(wl7).mint(4, bathIndex6, { value: 4 });
        await mgt_nft.connect(wl8).mint(4, bathIndex6, { value: 4 });
        await mgt_nft.connect(wl9).mint(4, bathIndex6, { value: 4 });
        await mgt_nft.connect(wl10).mint(4, bathIndex6, { value: 4 });
        await mgt_nft.connect(wl11).mint(4, bathIndex6, { value: 4 });
        await mgt_nft.connect(wl12).mint(4, bathIndex6, { value: 4 });
        // batch 14
        await fastForward(HOUR * 9)
        await mgt_nft.connect(wl4).mint(5, bathIndex7, { value: 5 });
        await mgt_nft.connect(wl5).mint(5, bathIndex7, { value: 5 });
        await mgt_nft.connect(wl6).mint(5, bathIndex7, { value: 5 });

        // set round 3 time
        await mgt_nft.connect(owner).setBatchStartAndEndTime(startTime1_3, endTime1_3, bathIndex1);
        await mgt_nft.connect(owner).setBatchStartAndEndTime(startTime2_3, endTime2_3, bathIndex2);
        await mgt_nft.connect(owner).setBatchStartAndEndTime(startTime3_3, endTime3_3, bathIndex3);
        await mgt_nft.connect(owner).setBatchStartAndEndTime(startTime4_3, endTime4_3, bathIndex4);
        await mgt_nft.connect(owner).setBatchStartAndEndTime(startTime5_3, endTime5_3, bathIndex5);
        await mgt_nft.connect(owner).setBatchStartAndEndTime(startTime6_3, endTime6_3, bathIndex6);
        await mgt_nft.connect(owner).setBatchStartAndEndTime(startTime7_3, endTime7_3, bathIndex7);
        // open public
        await mgt_nft.connect(owner).setBatchForPublic(true, bathIndex1);
        await mgt_nft.connect(owner).setBatchForPublic(true, bathIndex2);
        await mgt_nft.connect(owner).setBatchForPublic(true, bathIndex3);
        await mgt_nft.connect(owner).setBatchForPublic(true, bathIndex4);
        await mgt_nft.connect(owner).setBatchForPublic(true, bathIndex5);
        await mgt_nft.connect(owner).setBatchForPublic(true, bathIndex6);
        await mgt_nft.connect(owner).setBatchForPublic(true, bathIndex7);

        // batch 15
        await fastForward(HOUR * 6)
        // batch 16
        await fastForward(HOUR * 9)
        // batch 17
        await fastForward(HOUR * 3)
        await mgt_nft.connect(wl5).mint(2, bathIndex3, { value: 2 });
        // batch 18
        await fastForward(HOUR * 3)
        await mgt_nft.connect(wl4).mint(3, bathIndex4, { value: 3 });
        // batch 19
        await fastForward(HOUR * 3)
        await mgt_nft.connect(wl6).mint(15, bathIndex5, { value: 15 });
        await mgt_nft.connect(wl7).mint(15, bathIndex5, { value: 15 });
        await mgt_nft.connect(wl8).mint(15, bathIndex5, { value: 15 });
        // batch 20
        await fastForward(HOUR * 15)
        await mgt_nft.connect(wl13).mint(4, bathIndex6, { value: 4 });
        await mgt_nft.connect(wl14).mint(4, bathIndex6, { value: 4 });
        await mgt_nft.connect(wl15).mint(4, bathIndex6, { value: 4 });
        await mgt_nft.connect(wl16).mint(4, bathIndex6, { value: 4 });
        await mgt_nft.connect(wl17).mint(4, bathIndex6, { value: 4 });
        await mgt_nft.connect(project).mint(4, bathIndex6, { value: 4 });
        // batch 21
        await fastForward(HOUR * 9)
        await mgt_nft.connect(wl7).mint(5, bathIndex7, { value: 5 });
        await mgt_nft.connect(wl8).mint(5, bathIndex7, { value: 5 });
        await mgt_nft.connect(wl9).mint(5, bathIndex7, { value: 5 });
    });

    /* ------------ tokenURI ------------ */

    it('test tokenURI: ', async () => {
        //	mint 300 nfts
        const batchIndex = 1;
        const startID = 0;
        const endID = 299;
        const price = 1;
        const startTime = await currentTime();
        const endTime = startTime + DAY;
        const amountPerUser = 300;
        const forPublic = true;
        const config = [startID, endID, price, startTime, endTime, amountPerUser, forPublic];
        await mgt_nft.connect(owner).setBatchConfig(config, batchIndex);

        await mgt_nft.connect(wl1).mint(amountPerUser, batchIndex, { value: price * (amountPerUser) })


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

    /* ------------ withdraw ------------ */

	it('withdraw test', async () => {
		// mint
		// set config
        const batchIndex = 1;
        const startID = 0;
        const endID = 10;
        const price = 1;
        const startTime = await currentTime();
        const endTime = startTime + DAY;
        const amountPerUser = 5;
        const forPublic = false;
        const config = [startID, endID, price, startTime, endTime, amountPerUser, forPublic];
        await mgt_nft.connect(owner).setBatchConfig(config, batchIndex);
        // set whitelist
        const wls = [wl1.address, wl2.address];
        await mgt_nft.connect(owner).setBatchWhitelist(wls, batchIndex);
        await mgt_nft.connect(wl1).mint(amountPerUser, batchIndex, { value: price * amountPerUser });

		assert.equal(await getEthBalance(mgt_nft.address), price * amountPerUser);

		//	wrong caller
		await assert.revert(mgt_nft.connect(wl1).withdraw(), "have no rights do this");

		await mgt_nft.connect(project).withdraw()
		await mgt_nft.connect(copyright).withdraw()
	})

    /* ------------ upgrade ------------ */
    // it('upgrade test', async () => {
	// 	const MGTNFTv2 = await ethers.getContractFactory("MGTNFTV2");
    //     const mgt_nftv2 = await upgrades.upgradeProxy(mgt_nft.address, MGTNFTv2);
    //     console.log(mgt_nftv2.address);
	// })
})

