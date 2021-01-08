const logger = require("../logger/logger.js");

const delimeter = ",";

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