const path = require("path");
const nodemailer = require("nodemailer");

const initMailer = () => {
    console.log(path.join(__dirname,"/../config/.env"));
    console.log("config: ", process.env.smtpHost, process.env.email, process.env.emailPassword);
    const mailer = nodemailer.createTransport({
        host: process.env.smtpHost,
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.email, // generated ethereal user
          pass: process.env.emailPassword, // generated ethereal password
        },
      });
    return mailer;
}

const sendMail = async (recipients, subject, emailHtml) => {
    console.log("params", recipients, subject, emailHtml);
    try{
        const mailer = initMailer();
        let info = await mailer.sendMail({        
            from: '"Inventory Checker" <shodges201@gmail.com>', // sender address
            to: recipients, // list of receivers
            subject: subject, // Subject line
            html: emailHtml, // html body
        });
        return true;
    }
    catch(error){
        console.log("mailing error", error);
        return false;
    }
}

exports.sendMail = sendMail;
