module.exports = function (to, subject, html) {

    const send = require('gmail-send')({
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
        to,
        subject
    });

    send({ html }, (error, result, fullResult) => {
        if (error) console.error(error);
        console.log(result);
    });

}