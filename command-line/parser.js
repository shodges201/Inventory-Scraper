const { Command } = require('commander');
const program = new Command();
const logger = require("./../logger/logger.js");
const version = require("./../package.json").version;

const delimeter = ",";

function parseArguments(){
    program.version(version);
    // set defaults
    const defaultProductsSet = new Set();
    defaultProductsSet.add("ps5");
    defaultProductsSet.add("xbox");
    const defaultRefresh = 30;
    const defaultRecipients = [process.env.email];

    let products = new Set();
    let refresh = defaultRefresh;
    let recipients = defaultRecipients;

    program.option('-p --products <products>', 
                   'Specify the products seperated by commas without a trailing comma on the end. Allowed values are "ps5" and "xbox" currently.')
    program.option('-r --refresh <time>', 'Set the time between refreshes for checking inventory in minutes.')
    program.option('-e --email-recipients <recipients>' , 'Set the email recipients as a comma seperated list of email accounts')
    .parse(process.argv);

    logger.debug(JSON.stringify(program.opts()));

    if(program.products){
        const productsList = String(program.products).split(delimeter);
        productsList.forEach((product) => {
            product = product.trim().toLowerCase();
            if(!defaultProductsSet.has(product)){
                logger.error("Specified product is not supported or invalid values were supplied");
                process.exit(0);
            }
            else{
                products.add(product);
            }
        })
    }
    else{
        // no value specfied for the products so return the defaults
        logger.warn("no products passed in so all products are being checked");
        products = defaultProductsSet;
    }

    if(program.refresh){
        refresh = parseInt(program.refresh);
        if(refresh < 1 || refresh > 60){
            logger.error("Invalid refresh time. Must be between 0 and 60");
            process.exit(0);
        }
    }

    if(program.emailRecipients){
        recipientList = String(program.emailRecipients).toLowerCase().split(delimeter);
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        recipientList.forEach((email) => {
            if(!re.test(email)){
                logger.error("invalid email address used");
                process.exit(0);
            }
        })
        recipients = recipientList;
    }

    logger.debug(JSON.stringify({
        products: Array.from(products).toString(),
        refresh: refresh,
        emailRecipients: recipients
    }));

    return {
        products: products,
        refresh: refresh,
        emailRecipients: recipients
    }
}

exports.parseArguments = parseArguments;