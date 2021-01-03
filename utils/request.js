const puppeteer = require("puppeteer");
const logger = require("./../logger/logger.js");

const getHtml = async (url) => {
    logger.debug("fetching url " + url);
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    page.setJavaScriptEnabled(true);
    page.setBypassCSP(true);
    page.on("pageerror", err => {
      logger.warn("page error: " + err);
    })
    page.on("requestfailed", req => {
      logger.warn("Request failure while fetching HTML. Most likely an issue with a fetch the page does itself");
    })
    page.on("error", err => {
      logger.warn("There was an error: " + err);
    })
  
    await page.setExtraHTTPHeaders({
      "Accept":"application/html",
      "Connection":"keep-alive",
      "Accept-Encoding":"gzip, deflate, br",
      "Cache-Control":"no-cache",
      "User-Agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36"
    })
    try{
      await page.goto(url, {waitUntil: 'domcontentloaded'});
      const html = await page.evaluate(() => document.body.innerHTML);
      await page.close();
      await browser.close();
      return html;
    }
    catch(err){
      logger.error("there was an error while fetching the html", err);
      await page.close();
      await browser.close();
      return null;
    }
}

exports.getHtml = getHtml; 