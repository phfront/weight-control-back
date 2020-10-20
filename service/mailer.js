const config = require('../config.json');

module.exports = function (to, subject, html) {

    const send = require('gmail-send')({
        user: config.googleApp.smtp_username,
        pass: config.googleApp.smtp_password,
        to,
        subject
    });

    send({ html }, (error, result, fullResult) => {
        if (error) console.error(error);
        console.log(result);
    });

}