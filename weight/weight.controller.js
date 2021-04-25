const express = require('express');
const router = express.Router();
const weightService = require('./weight.service');
const ForgotRedirect = require('../model/forgotRedirect');
const md5 = require('md5');
const mailer = require('../service/mailer');
const jwt = require('jsonwebtoken');

const create = (req, res) => {
    weightService.create(req.body, req.headers, function (result) {
        if (result.success) {
            res.json(result);
        } else {
            res.status(500).json(result);
        }
    });
}

const list = (req, res) => {
    weightService.list(req.headers, function (result) {
        if (result.success) {
            res.json(result);
        } else {
            res.status(500).json(result);
        }
    });
}

const remove = (req, res) => {
    weightService.remove(req.body, function (result) {
        if (result.success) {
            res.json(result);
        } else {
            res.status(500).json(result);
        }
    });
}

// routes
router.post('/', create);
router.get('/', list);
router.delete('/', remove);

module.exports = router;