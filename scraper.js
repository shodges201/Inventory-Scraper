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

/**
 * A singleton instance of a cron job that is created once and then runs in an interval of {refresh} minutes
 * @param {Set<string>} productsToCheck Products to check invetory for
 * @param {} recipients Email recipients of updates
 * @param {int} refresh Interval in minutes for how often to check product stock
 */
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

/**
 * A factory function that retuns an object for final status of whether something is in stock or not
 */
function resultsObjectFactory(){
  return {
    xbox: null,
    ps5: null
  }
}
/**
 * Formats the HTML using the handlebars template to then be used for sending out the status email
 * @param {object} statuses an instance of the resultsObjectFactory object with values for products that are being checked
 */
function formatStatuses(statuses){
  const source = fs.readFileSync(filePath, 'utf-8').toString();
  const template = handlebars.compile(source);
  const htmlToSend = template(statuses);
  return htmlToSend;
}