const cheerio = require("cheerio");
const puppeteer = require("puppeteer");
const nodemailer = require("nodemailer");
const fs = require("fs");
const handlebars = require("handlebars");
const path = require("path");
const CronJob = require("cron").CronJob;
require("dotenv").config({
  path:path.join(__dirname,"/config/.env")
})

const inStock = "In Stock!";
const outOfStock = "Out of stock";
const mailer = nodemailer.createTransport({
  host: process.env.smtpHost,
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.email, // generated ethereal user
    pass: process.env.emailPassword, // generated ethereal password
  },
});

const filePath = path.join(__dirname, "/email.hbs");
const recipients = "shodges201@gmail.com, b.hodges1055.bh@gmail.com";
const subject = "Inventory Check";

const job = new CronJob('0 */1 * * * *', async() => {
  console.log("starting");
  const statuses = await getXboxStatuses();
  let inStock = false;
  // check if anything is in stock
  // if there is no stock, don't send an email
  statuses.statuses.forEach((item, index) => {
    inStock = inStock || item.availability;
  });
  if(inStock){
    const emailHtml = formatStatuses(statuses);
    console.log("email html: " + emailHtml);
    let info = await mailer.sendMail({        
      from: '"Inventory Checker" <shodges201@gmail.com>', // sender address
      to: recipients, // list of receivers
      subject: subject, // Subject line
      html: emailHtml, // html body
    });
  }
  else{
    console.log("There was no stock available so no email was sent");
  }
});

job.start();

function formatStatuses(statuses){
  const source = fs.readFileSync(filePath, 'utf-8').toString();
  const template = handlebars.compile(source);
  const htmlToSend = template(statuses);
  return htmlToSend;
}

async function getXboxStatuses(){
  const rawdata = fs.readFileSync('xbox-urls.json');
  const xboxUrls = JSON.parse(rawdata);
  const walmartIndex = 0;
  const bestBuyIndex = 1;
  const gameStopIndex = 2;
  const neweggIndex = 3;

  //initial statuses array to be used for handlebars
  xboxStatuses = {
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
  //keep indexes for easy
  const bestBuyHtml = await getHtmlPuppeteer(xboxUrls.bestBuy);
  const gameStopHtml = await getHtmlPuppeteer(xboxUrls.gameStop);
  const walmartHtml = await getHtmlPuppeteer(xboxUrls.walmart);
  const neweggHtml = await getHtmlPuppeteer(xboxUrls.newegg);
  xboxStatuses.statuses[bestBuyIndex].availability = checkBestBuyHtml(bestBuyHtml);
  xboxStatuses.statuses[gameStopIndex].availability = checkGameStopHtml(gameStopHtml);
  xboxStatuses.statuses[walmartIndex].availability = checkWalmartHtml(walmartHtml);
  xboxStatuses.statuses[neweggIndex].availability = checkNewEggHtml(neweggHtml);
  console.log("finished querying pages" + JSON.stringify(xboxStatuses));
  return xboxStatuses;
}

function checkNewEggHtml(html){
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

function checkWalmartHtml(html){
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


function checkGameStopHtml(html){
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

/**
 * Will need to check the 
 * @param {string} html 
 */
function checkTargetHtml(html){
  const $ = cheerio.load(html);

}

function checkBestBuyHtml(html){
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

async function getHtmlPuppeteer(url){
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