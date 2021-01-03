const fs = require("fs");
const handlebars = require("handlebars");
const path = require("path");
const CronJob = require("cron").CronJob;
const { sendMail } = require("./utils/mailer");
const { getStatuses } = require("./statusRetrievers/xboxStatus");
require("dotenv").config();
const logger = require("./logger/logger.js");

const filePath = path.join(__dirname, "/views/email.hbs");
const recipients = "shodges201@gmail.com, b.hodges1055.bh@gmail.com";
const subject = "Inventory Check";
const jsonFileLocations = {
  xbox: "xbox/urls.json",
  ps5: "ps5/urls.json"
}

const job = new CronJob('0 */1 * * * *', async() => {
  logger.debug("starting job");
  const statuses = resultsObjectFactory();
  const xboxStatuses = await getStatuses(jsonFileLocations.xbox);
  const ps5Statuses = await getStatuses(jsonFileLocations.ps5);
  statuses.xbox = xboxStatuses;
  statuses.ps5 = ps5Statuses;
  let inStock = false;
  // check if anything is in stock
  // if there is no stock, don't send an email
  statuses.xbox.statuses.forEach((item, index) => {
    inStock = inStock || item.availability;
  });
  statuses.ps5.statuses.forEach((item, index) => {
    inStock = inStock || item.availability;
  });
  if(inStock){
    const emailHtml = formatStatuses(statuses);
    console.debug("email html: " + emailHtml);
    await sendMail(recipients, subject, emailHtml);
  }
  else{
    logger.debug("There was no stock available so no email was sent");
  }
});

job.start();

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