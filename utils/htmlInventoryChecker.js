const cheerio = require("cheerio");
const logger = require("./../logger/logger.js");

/**
 * Parses html of newegg with cheerio 
 * @param {html} html Raw HTML to be parsed using cheerio 
 */
const checkNewEggInventoryHtml = (html) => {
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

/**
 * Parses html of newegg with cheerio and returns the price
 * @param {html} html Raw HTML to be parsed using cheerio 
 */
const checkNewEggPriceHtml = (html) => {
  try{
    if(html === null){
      logger.error("new egg html was null");
      return null;
    }
    const $ = cheerio.load(html);
    let dollars = parseInt($(".product-price").children(".price").children(".price-current").children("strong").text().trim());
    let cents = parseFloat($(".product-price").children(".price").children(".price-current").children("sup").text().trim());
    let price = dollars + cents;

    logger.debug("price of newegg: " + price);
    return price;
  }
  catch(err){
    logger.error("error with newegg price parsing" + err);
    return null;
  }
}
 
/**
 * Parses html of walmart with cheerio and checks for inventory
 * @param {html} html Raw HTML to be parsed using cheerio 
 */
const checkWalmartInventoryHtml = (html) => {
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

/**
 * Parses html of walmart with cheerio and returns the price
 * @param {html} html Raw HTML to be parsed using cheerio 
 */
const checkWalmartPriceHtml = (html) => {
  try{
    if(html === null){
      logger.error("walmart html was null");
      return null;
    }
    const $ = cheerio.load(html);
    // find element with class 'price-characteristic' and attribute with name 'content'
    const dollarsElement = $(".prod-PriceSection").find(".price-characteristic").first();
    const centsElement = dollarsElement.siblings(".price-mantissa").first();
    logger.debug(`dollars string walmart: ${dollarsElement.text().trim()}`);
    logger.debug(`cents string walmart: ${"." + centsElement.text().trim()}`);
    const dollars = parseInt(dollarsElement.text().trim());
    const cents = parseFloat("." + centsElement.text().trim());
    let price = dollars + cents;

    logger.debug("walmart price: " + price);
    return price;
  }
  catch(err){
    logger.error("error with walmart price parsing" + err);
    return null;
  }
}
  
/**
 * Parses html of GameStop with cheerio and checks for inventory
 * @param {html} html Raw HTML to be parsed using cheerio 
 */ 
const checkGameStopInventoryHtml = (html) => {
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

/**
 * Parses html of GameStop with cheerio and returns the price
 * @param {html} html Raw HTML to be parsed using cheerio 
 */ 
const checkGameStopPriceHtml = (html) => {
  try{
    if(html === null){
      logger.error("game stop html was null");
      return null;
    }
    const $ = cheerio.load(html);
    const productJsonData = JSON.parse($(".add-to-cart").attr("data-gtmdata"));
    const price = productJsonData.price.sellingPrice;
    logger.debug("game stop price: " + price);
    return price;
  }
  catch(err){
    logger.error("error with game stop price checking " + err);
    return null;
  }
}
 
/**
 * Parses html of BestBuy with cheerio and checks for inventory
 * @param {html} html Raw HTML to be parsed using cheerio 
 */
const checkBestBuyInventoryHtml = (html) => {
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
 * Parses html of BestBuy with cheerio and returns price
 * @param {html} html Raw HTML to be parsed using cheerio 
 */
const checkBestBuyPriceHtml = (html) => {
  try{
    if(html === null){
      logger.error("best buy html was null");
      return null;
    }
    const $ = cheerio.load(html);
    // TODO This is SUPER GROSS and hacky revisit.
    // Best Buy has a tricky way of organizing their page and after significant effort this was the best that could be done for the moment
    const priceElement = $(".priceView-price-match-guarantee").first().siblings().first().children().first().children().first().children().first().children().first();

    logger.debug("price string for best buy: " + priceElement.text().trim());
    const price = parseFloat(priceElement.text().trim().replace("$", ""));
    logger.debug("best buy price: " + price);
    return price;
  }
  catch(err){
    logger.error("error with best buy parsing " + err);
    return null;
  }
}

exports.checkBestBuyInventoryHtml = checkBestBuyInventoryHtml;
exports.checkBestBuyPriceHtml = checkBestBuyPriceHtml;

exports.checkGameStopInventoryHtml = checkGameStopInventoryHtml;
exports.checkGameStopPriceHtml = checkGameStopPriceHtml;

exports.checkNewEggInventoryHtml = checkNewEggInventoryHtml;
exports.checkNewEggPriceHtml = checkNewEggPriceHtml;

exports.checkWalmartInventoryHtml = checkWalmartInventoryHtml;
exports.checkWalmartPriceHtml = checkWalmartPriceHtml;
