const fs = require("fs");
const path = require("path");
const { getHtml } = require("../utils/request");
const {
        checkBestBuyInventoryHtml, 
        checkGameStopInventoryHtml, 
        checkNewEggInventoryHtml, 
        checkWalmartInventoryHtml,
        checkBestBuyPriceHtml, 
        checkGameStopPriceHtml, 
        checkNewEggPriceHtml,
        checkWalmartPriceHtml
      } = require("../utils/htmlInventoryChecker");
const logger = require("../logger/logger.js");

const walmartIndex = 0;
const bestBuyIndex = 1;
const gameStopIndex = 2;
const neweggIndex = 3;

/**
 * Gets the status of a given products based on the path input of json formatted website names to urls
 * See /urls/<product-name>/urls.json for an example of the json format that is passed in
 * @param {string} path File path from the base dir of the project to a json object that maps product name to the URL to check
 */
async function getStatuses(filePath){
    const rawdata = fs.readFileSync(path.join(__dirname, `/../urls/${filePath}`));
    const urls = JSON.parse(rawdata);
  
    //initial statuses array to be used for handlebars
    inventoryStatuses = statusFactory(urls);

    //keep indexes for easy
    const bestBuyHtml = await getHtml(urls.bestBuy);
    const gameStopHtml = await getHtml(urls.gameStop);
    const walmartHtml = await getHtml(urls.walmart);
    const neweggHtml = await getHtml(urls.newegg);
    // check html for inventory status
    inventoryStatuses.statuses[bestBuyIndex].availability = checkBestBuyInventoryHtml(bestBuyHtml);
    inventoryStatuses.statuses[gameStopIndex].availability = checkGameStopInventoryHtml(gameStopHtml);
    inventoryStatuses.statuses[walmartIndex].availability = checkWalmartInventoryHtml(walmartHtml);
    inventoryStatuses.statuses[neweggIndex].availability = checkNewEggInventoryHtml(neweggHtml);
    // check html for price
    inventoryStatuses.statuses[bestBuyIndex].price = checkBestBuyPriceHtml(bestBuyHtml);
    inventoryStatuses.statuses[gameStopIndex].price = checkGameStopPriceHtml(gameStopHtml);
    inventoryStatuses.statuses[walmartIndex].price = checkWalmartPriceHtml(walmartHtml);
    inventoryStatuses.statuses[neweggIndex].price = checkNewEggPriceHtml(neweggHtml);

    logger.debug("finished querying pages" + JSON.stringify(inventoryStatuses));
    return inventoryStatuses;
}

/**
 * Retuns a new instance of the object that will be used to hold information including website name, availability, and url that was checked
 * for each product that is checked.
 * @param {json} urls A json object of website name to product urls that are going to be checked 
 */
const statusFactory = (urls) => {
    //initial statuses array to be used for handlebars
    return {
      statuses: [
      {
        name: "Walmart",
        availability: null,
        url: urls.walmart,
        price: null
      },
      {
        name: "Best Buy",
        availability: null,
        url: urls.bestBuy,
        price: null
      },
      {
        name: "GameStop",
        availability: null,
        url: urls.gameStop,
        price: null
      },
      {
        name: "Newegg",
        availability: null,
        url: urls.newegg,
        price: null
      }
    ]};
}

exports.getStatuses = getStatuses;