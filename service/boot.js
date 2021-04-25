const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('_helpers/jwt');
const errorHandler = require('_helpers/error-handler');

module.exports = (err) => {
    if (err) {
        return console.log(err);
    }

    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.use(cors());

    // use JWT auth to secure the api
    app.use(jwt());

    // api routes
    app.use('/api/user', require('../user/user.controller'));
    app.use('/api/weight', require('../weight/weight.controller'));

    // global error handler
    app.use(errorHandler);

    // start server
    const port = process.env.PORT || 4000;
    app.listen(port, function () {
        const env = process.env.PROD === 'false' ? 'dev' : 'prod';
        console.log(`running ${env} on port ${port}`);
    });

}