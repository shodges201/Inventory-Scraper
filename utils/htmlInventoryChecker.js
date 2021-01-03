const cheerio = require("cheerio");
const logger = require("./../logger/logger.js");

const checkNewEggHtml = (html) => {
    try{
      if(html === null){
        logger.error("new egg html was null");
        return false;
      }
      const $ = cheerio.load(html);
      logger.debug("new egg status: " + $(".product-inventory").children("strong").text());
      let inStock = $(".product-inventory").children("strong").text().trim().includes("In stock.");
      if(inStock == null){
        inStock = false;
      }
      logger.debug("newegg is in stock: " + inStock);
      return inStock;
    }
    catch(err){
      logger.error("error with newegg parsing" + err);
      return false;
    }
}
  
const checkWalmartHtml = (html) => {
    try{
      if(html === null){
        logger.error("walmart html was null");
        return false;
      }
      const $ = cheerio.load(html);
      // this is really just a sanity check as the page won't even load if the product is out of stock
      let inStock = $(".spin-button-children").text().includes("Add to cart");
      if(inStock == null){
        inStock = false;
      }
      logger.debug("walmart is in stock: " + inStock);
      return inStock;
    }
    catch(err){
      logger.error("error with walmart parsing" + err);
      return false;
    }
}
  
  
const checkGameStopHtml = (html) => {
    try{
      if(html === null){
        logger.error("game stop html was null");
        return false;
      }
      const $ = cheerio.load(html);
      const productJsonData = JSON.parse($(".add-to-cart").attr("data-gtmdata"));
      const inStock = productJsonData.productInfo.availability === "Available";
      logger.debug("game stop is in stock: " + inStock);
      return inStock;
    }
    catch(err){
      logger.error("error with game stop parsing " + err);
      return false;
    }
}
  
const checkBestBuyHtml = (html) => {
    try{
      if(html === null){
        logger.error("best buy html was null");
        return false;
      }
      const $ = cheerio.load(html);
      const inStock = !$(".add-to-cart-button").attr("disabled");
      logger.debug("best buy is in stock: " + inStock);
      return inStock;
    }
    catch(err){
      logger.error("error with best buy parsing " + err);
      return false;
    }
}
  
  /**
   * Will need to check the 
   * @param {string} html 
   */
const checkTargetHtml = (html) => {
    const $ = cheerio.load(html);
}

exports.checkBestBuyHtml = checkBestBuyHtml;
exports.checkGameStopHtml = checkGameStopHtml;
exports.checkNewEggHtml = checkNewEggHtml;
exports.checkWalmartHtml = checkWalmartHtml;
exports.checkTargetHtml = checkTargetHtml;