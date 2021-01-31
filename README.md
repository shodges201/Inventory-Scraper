# Inventory-Scraper

Inventory scraper, only way to beat the bots is to join them.

## Introduction
Inventory Scraper is a way to easily check the status of products like Xbox Series X and PS5. A full list of currently supported products are listed below. Inventory scraper will send emails to anyone you want and give updates on the status of any products that are in stock. An SMTP server will need to be setup to send these emails as this is designed to be run the by the user as a script. The script will continously run and check for stock in intervals that you can specify, more details below.

## Using Inventory Scraper

### Setting up the script
There are multiple ways to set up the script, the first being running the script from the command line and alternatively is to run it using Docker.

#### Setting up the .env file
The .env file is vital to running the script either way. Take the .sample-env file from the base directory of the project and replace the values with whatever values you require, more details for each value are outlined below.

##### Environment variables
* email: The email address being used to send the emails.
* emailPassword: The password for the email address being used to send the emails
* smtpHost: The smtp server/hostname to be used with the credentials above to send the emails.
* products: The products you would like to be checked. Supported products and how they should be specified are as follows
	* Xbox Series X: "xbox"
	* PlayStation 5: "ps5"
* recipients: The email addresses of those who will receive emails about products in stock.
* refresh: The number of minutes between checks for supply. 

#### Command Line
Running the script on the command line after creating the .env file is as easy as running the following  from the command line with node.js installed:
* Install the scripts dependencies using `npm i`
* Run the script using either `npm start`

#### Docker
The following commands can be run to create a docker image of the script.
`docker build -t <name of image to create> .`
Afterwards the following command can be run to create a Docker container from that image. A series of characters will print to the terminal afterwards, copy these and use them in the next command.
`docker create <name of container>`
Then the container can be run using the following command.
`docker start <characters from above>`
### Supported products currently
* PS5
* Xbox Series X
### Planned future products
* GeForce RTX 3000 series (Coming Soon)
* Ryzen 7 series(Coming soon)
* Ryzen 9 series (Coming soon)
### Suppliers Checked
* Newegg
* Walmart
* Gamestop
* Best Buy
### Planned Future suppliers
* Target (Coming Soon)
* Amazon (Coming Soon)