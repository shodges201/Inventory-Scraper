const logger = require("../logger/logger.js");

/*
    The delimeter used to seperate items in a list in the .env file
*/
const delimeter = ",";

/**
 * Returns a Set of strings that represent the products that should be checked for
 * @param {string} products A {delimieter} separated string of products 
 * @returns {Set<string>} A set of strings that are the items that will be checked for
 */
function parseProducts(products) {
    const defaultProductsSet = new Set();
    let productsSet = new Set();
    defaultProductsSet.add("ps5");
    defaultProductsSet.add("xbox");
    if (products) {
        const productsList = String(products).split(delimeter);
        productsList.forEach((product) => {
            product = product.trim().toLowerCase();
            if (!defaultProductsSet.has(product)) {
                logger.error("Specified product is not supported or invalid values were supplied");
                process.exit(0);
            }
            else {
                productsSet.add(product);
            }
        })
    }
    else {
        // no value specfied for the products so return the defaults
        logger.warn("no products passed in so all products are being checked");
        productsSet = defaultProductsSet;
    }
    return productsSet;
}

/**
 * Parses the refresh rate of checking the inventory of products, and will be used in the cron job.
 * @param {int} refresh 
 */
function parseRefresh(refresh){
    if(refresh){
        refresh = parseInt(refresh);
        if(refresh < 1 || refresh > 60){
            logger.error("Invalid refresh time. Must be between 0 and 60");
            process.exit(0);
        }
    }
    return refresh;
}

/**
 * Parses the emailRecipients string and returns an array of email addresses
 * @param {string} emailRecipients A {delimiter} separated string of email addresses 
 */
function parseRecipients(emailRecipients){
    if(emailRecipients){
        recipientList = String(emailRecipients).toLowerCase().split(delimeter);
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        recipientList.forEach((email) => {
            if(!re.test(email)){
                logger.error("invalid email address used");
                process.exit(0);
            }
        })
        recipients = recipientList;
    }
    return recipients;
}

exports.parseProducts = parseProducts;
exports.parseRecipients = parseRecipients;
exports.parseRefresh = parseRefresh;