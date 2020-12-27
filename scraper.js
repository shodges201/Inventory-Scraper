const fs = require("fs");
const handlebars = require("handlebars");
const path = require("path");
const CronJob = require("cron").CronJob;
const { sendMail } = require("./utils/mailer");
const { getXboxStatuses } = require("./statusRetrievers/xboxStatus");
require("dotenv").config();

const filePath = path.join(__dirname, "/views/email.hbs");
const recipients = "shodges201@gmail.com, b.hodges1055.bh@gmail.com";
const subject = "Inventory Check";

const job = new CronJob('0 */1 * * * *', async() => {
  console.log("starting");
  const xboxStatuses = await getXboxStatuses();
  let inStock = false;
  // check if anything is in stock
  // if there is no stock, don't send an email
  xboxStatuses.statuses.forEach((item, index) => {
    inStock = inStock || item.availability;
  });
  if(inStock){
    const emailHtml = formatStatuses(xboxStatuses);
    console.log("email html: " + emailHtml);
    await sendMail(recipients, subject, emailHtml);
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