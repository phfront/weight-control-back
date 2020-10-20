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
    app.use('/user', require('../user/user.controller'));
    app.use('/deck', require('../deck/deck.controller'));
    app.use('/mycards', require('../mycards/mycards.controller'));

    // global error handler
    app.use(errorHandler);

    // start server
    const port = process.env.NODE_ENV === 'production' ? 80 : 4000;
    const server = app.listen(port, function () {
        console.log('Server listening on port ' + port);
    });

}