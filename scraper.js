const fs = require("fs");
const handlebars = require("handlebars");
const path = require("path");
const CronJob = require("cron").CronJob;
const { sendMail } = require("./utils/mailer");
const { getStatuses } = require("./statusRetrievers/statusRetriever");
require("dotenv").config();
const logger = require("./logger/logger.js");
const { parseProducts, parseRecipients, parseRefresh } = require("./env-parsing/parser.js");

const filePath = path.join(__dirname, "/views/email.hbs");
const subject = "Inventory Check";
const jsonFileLocations = {
  xbox: "xbox/urls.json",
  ps5: "ps5/urls.json"
}

function createCronJob(productsToCheck, recipients, refresh) {
  const job = new CronJob(`0 */${refresh} * * * *`, async() => {
    logger.debug("starting job");
    let inStock = false;
    const statuses = resultsObjectFactory();
    if(productsToCheck.has("xbox")){
      const xboxStatuses = await getStatuses(jsonFileLocations.xbox);
      statuses.xbox = xboxStatuses;
      statuses.xbox.statuses.forEach((item) => {
        inStock = inStock || item.availability;
      });
    }
    if(productsToCheck.has("ps5")){
      const ps5Statuses = await getStatuses(jsonFileLocations.ps5);
      statuses.ps5 = ps5Statuses;
      statuses.ps5.statuses.forEach((item) => {
        inStock = inStock || item.availability;
      });
    }

    if(inStock){
      const emailHtml = formatStatuses(statuses);
      console.debug("email html: " + emailHtml);
      await sendMail(recipients, subject, emailHtml);
    }
    else{
      logger.debug("There was no stock available so no email was sent");
    }
  });
  return job;
}

(() => {
  const products = parseProducts(process.env.products);
  const recipients = parseRecipients(process.env.recipients);
  const refresh = parseRefresh(process.env.refresh);
  const job = createCronJob(products, recipients, refresh);
  job.start();
})();

function resultsObjectFactory(){
  return {
    xbox: null,
    ps5: null
  }
}

function formatStatuses(statuses){
  const source = fs.readFileSync(filePath, 'utf-8').toString();
  const template = handlebars.compile(source);
  const htmlToSend = template(statuses);
  return htmlToSend;
}