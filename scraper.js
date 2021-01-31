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


const productsToCheck = parseProducts(process.env.products);
const recipients = parseRecipients(process.env.recipients);
const refresh = parseRefresh(process.env.refresh);
const job = new CronJob({
  cronTime: `0 */${refresh} * * * *`, 
  onTick: performJobWrapper,
  start: false,
  timeZone: "America/New_York"
});
job.start();


/**
 * 
 * @param {*} productsToCheck 
 * @param {*} recipients 
 * @param {*} job 
 */
async function performJobWrapper() {
  job.stop();

  logger.debug("starting job");
  let inStock = false;
  const statuses = resultsObjectFactory();
  if (productsToCheck.has("xbox")) {
    const xboxStatuses = await getStatuses(jsonFileLocations.xbox);
    statuses.xbox = xboxStatuses;
    statuses.xbox.statuses.forEach((item) => {
      inStock = inStock || item.availability;
    });
  }
  if (productsToCheck.has("ps5")) {
    const ps5Statuses = await getStatuses(jsonFileLocations.ps5);
    statuses.ps5 = ps5Statuses;
    statuses.ps5.statuses.forEach((item) => {
      inStock = inStock || item.availability;
    });
  }

  //inStock = true;

  if (inStock) {
    const emailHtml = formatStatuses(statuses);
    console.debug("email html: " + emailHtml);
    await sendMail(recipients, subject, emailHtml);
  }
  else {
    logger.debug("There was no stock available so no email was sent");
  }

  job.start();
}

/**
 * A factory function that retuns an object for status of whether something is in stock or not.
 * Each key will hold another object that looks like what is returned from statusRetreiver's objectFactory() function
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