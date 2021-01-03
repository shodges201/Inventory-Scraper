const { Command } = require('commander');
const program = new Command();
const logger = require("./../logger/logger.js");

function parseArguments(){
    program.version('0.0.1');
    const defaultProductsSet = new Set();
    defaultProductsSet.add("ps5");
    defaultProductsSet.add("xbox");
    let products = new Set();
    program.option('-p --products <products>', 
                   'Specify the products seperated by semicolons without a trailing semicolon on the end. Allowed values are "ps5" and "xbox" currently.')
    .parse(process.argv);
    console.log(program.opts());
    if(program.products){
        const productsList = program.products.split(";");
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
    return products;
}

exports.parseArguments = parseArguments;