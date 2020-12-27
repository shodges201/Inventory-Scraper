const fs = require("fs");
const path = require("path");
const { getHtml } = require("./../utils/request");
const {checkBestBuyHtml, checkGameStopHtml, checkNewEggHtml, checkWalmartHtml} = require("./../utils/htmlInventoryChecker");

const walmartIndex = 0;
const bestBuyIndex = 1;
const gameStopIndex = 2;
const neweggIndex = 3;

async function getXboxStatuses(){
    const rawdata = fs.readFileSync(path.join(__dirname, '/../urls/xbox-urls.json'));
    const xboxUrls = JSON.parse(rawdata);
  
    //initial statuses array to be used for handlebars
    xboxStatuses = xboxStatusFactory(xboxUrls);

    //keep indexes for easy
    const bestBuyHtml = await getHtml(xboxUrls.bestBuy);
    const gameStopHtml = await getHtml(xboxUrls.gameStop);
    const walmartHtml = await getHtml(xboxUrls.walmart);
    const neweggHtml = await getHtml(xboxUrls.newegg);
    xboxStatuses.statuses[bestBuyIndex].availability = checkBestBuyHtml(bestBuyHtml);
    xboxStatuses.statuses[gameStopIndex].availability = checkGameStopHtml(gameStopHtml);
    xboxStatuses.statuses[walmartIndex].availability = checkWalmartHtml(walmartHtml);
    xboxStatuses.statuses[neweggIndex].availability = checkNewEggHtml(neweggHtml);
    console.log("finished querying pages" + JSON.stringify(xboxStatuses));
    return xboxStatuses;
}

const xboxStatusFactory = (xboxUrls) => {
    //initial statuses array to be used for handlebars
    return {
      statuses: [
      {
        name: "walmart",
        availability: null,
        url: xboxUrls.walmart
      },
      {
        name: "Best Buy",
        availability: null,
        url: xboxUrls.bestBuy
      },
      {
        name: "GameStop",
        availability: null,
        url: xboxUrls.gameStop
      },
      {
        name: "Newegg",
        availability: null,
        url: xboxUrls.newegg
      }
    ]};
}

exports.getXboxStatuses = getXboxStatuses;