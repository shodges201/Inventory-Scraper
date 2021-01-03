const fs = require("fs");
const path = require("path");
const { getHtml } = require("./../utils/request");
const {checkBestBuyHtml, checkGameStopHtml, checkNewEggHtml, checkWalmartHtml} = require("./../utils/htmlInventoryChecker");

const walmartIndex = 0;
const bestBuyIndex = 1;
const gameStopIndex = 2;
const neweggIndex = 3;

/**
 * 
 * @param {string} path 
 */
async function getStatuses(filePath){
    const rawdata = fs.readFileSync(path.join(__dirname, `/../urls/${filePath}`));
    const urls = JSON.parse(rawdata);
  
    //initial statuses array to be used for handlebars
    xboxStatuses = statusFactory(urls);

    //keep indexes for easy
    const bestBuyHtml = await getHtml(urls.bestBuy);
    const gameStopHtml = await getHtml(urls.gameStop);
    const walmartHtml = await getHtml(urls.walmart);
    const neweggHtml = await getHtml(urls.newegg);
    xboxStatuses.statuses[bestBuyIndex].availability = checkBestBuyHtml(bestBuyHtml);
    xboxStatuses.statuses[gameStopIndex].availability = checkGameStopHtml(gameStopHtml);
    xboxStatuses.statuses[walmartIndex].availability = checkWalmartHtml(walmartHtml);
    xboxStatuses.statuses[neweggIndex].availability = checkNewEggHtml(neweggHtml);
    console.debug("finished querying pages" + JSON.stringify(xboxStatuses));
    return xboxStatuses;
}

const statusFactory = (urls) => {
    //initial statuses array to be used for handlebars
    return {
      statuses: [
      {
        name: "walmart",
        availability: null,
        url: urls.walmart
      },
      {
        name: "Best Buy",
        availability: null,
        url: urls.bestBuy
      },
      {
        name: "GameStop",
        availability: null,
        url: urls.gameStop
      },
      {
        name: "Newegg",
        availability: null,
        url: urls.newegg
      }
    ]};
}

exports.getStatuses = getStatuses;