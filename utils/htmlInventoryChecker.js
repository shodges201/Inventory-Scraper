const cheerio = require("cheerio");

const checkNewEggHtml = (html) => {
    try{
      if(html === null){
        console.log("new egg html was null");
        return false;
      }
      const $ = cheerio.load(html);
      console.log("new egg status: " + $(".product-inventory").children("strong").text());
      let inStock = $(".product-inventory").children("strong").text().trim().includes("In stock.");
      if(inStock == null){
        inStock = false;
      }
      console.log("newegg is in stock: " + inStock);
      return inStock;
    }
    catch(err){
      console.error("error with newegg parsing" + err);
      return false;
    }
}
  
const checkWalmartHtml = (html) => {
    try{
      if(html === null){
        return false;
      }
      const $ = cheerio.load(html);
      // this is really just a sanity check as the page won't even load if the product is out of stock
      let inStock = $(".spin-button-children").text().includes("Add to cart");
      if(inStock == null){
        inStock = false;
      }
      console.log("walmart is in stock: " + inStock);
      return inStock;
    }
    catch(err){
      console.error("error with walmart parsing" + err);
      return false;
    }
}
  
  
const checkGameStopHtml = (html) => {
    try{
      const $ = cheerio.load(html);
      const productJsonData = JSON.parse($(".add-to-cart").attr("data-gtmdata"));
      const inStock = productJsonData.productInfo.availability === "Available";
      console.log("game stop is in stock: " + inStock);
      return inStock;
    }
    catch(err){
      console.error("error with game stop parsing " + err);
      return false;
    }
}
  
const checkBestBuyHtml = (html) => {
    try{
      const $ = cheerio.load(html);
      const inStock = !$(".add-to-cart-button").attr("disabled");
      console.log("best buy is in stock: " + inStock);
      return inStock;
    }
    catch(err){
      console.error("error with best buy parsing " + err);
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