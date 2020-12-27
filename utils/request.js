const puppeteer = require("puppeteer");

const getHtml = async (url) => {
    console.log("fetching url " + url);
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    page.setJavaScriptEnabled(true);
    page.setBypassCSP(true);
    page.on("pageerror", err => {
      console.error("page error: " + err);
    })
    page.on("requestfailed", req => {
      console.error("request failed");
    })
    page.on("error", err => {
      console.error("There was an error: " + err);
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
      console.log("there was an error that was caught");
      console.log(err);
      await page.close();
      await browser.close();
      return null;
    }
}

exports.getHtml = getHtml; 