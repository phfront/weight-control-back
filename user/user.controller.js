const express = require('express');
const router = express.Router();
const userService = require('./user.service');
const User = require('../model/user');
const Deck = require('../model/deck');
const MyCards = require('../model/mycards');
const ForgotRedirect = require('../model/forgotRedirect');
const md5 = require('md5');
const mailer = require('../service/mailer');
const config = require('../config.json');

// routes
router.post('/register', register);
router.post('/authenticate', authenticate);
router.get('/', getAll);
router.get('/:userId/deck', getDecks);
router.post('/forgotpassword', forgotPassword);
router.post('/changePassword', changePassword);

module.exports = router;

function authenticate(req, res, next) {
    userService.authenticate(req.body, function (result) {
        if (result.success) {
            res.json(result);
        } else {
            res.status(500).json(result);
        }
    });
}

function getAll(req, res, next) {
    userService.getAll()
        .then(users => res.json(users))
        .catch(next);
}

function getDecks(req, res) {
    const userId = req.param('userId');
    Deck.find({ userId }, (err, decks) => {
        if (err) {
            res.status(500).json({
                success: false,
                errors: ['Error ao buscar decks']
            })
        } else {
            res.json({
                success: true,
                decks
            })
        }
    })
}

function register(req, res, next) {
    const errors = [];
    const { name, email, username, password } = req.body;
    if (!name) errors.push('Nome obrigatório');
    if (!email) errors.push('Email obrigatório');
    if (!username) errors.push('Username obrigatório');
    if (!password) errors.push('Senha obrigatória');
    if (errors.length) {
        res.status(500).json({
            success: false,
            errors
        });
    } else {
        User.find({}, function (err, users) {
            if (err) {
                res.status(500).json(err);
            } else {
                if (users.find(user => user.email === email)) {
                    res.status(500).json(['Já existe um usuário com esse email']);
                } else if (users.find(user => user.username === username)) {
                    res.status(500).json(['Já existe um usuário com esse username']);
                } else {
                    const user = new User({ name, email, username, password: md5(password) });
                    user.save((err2, person) => {
                        if (err2) {
                            res.status(500).send({ message: 'Erro ao registrar o usuário' });
                        } else {
                            const mycards = new MyCards({ userId: person._id });
                            mycards.save();
                            res.send({
                                success: true,
                                person
                            });
                        }
                    })
                }
            }
        })
    }
}

function forgotPassword(req, res) {
    const { email } = req.body;
    const errors = [];
    if (!email) errors.push('Email é obrigatório');
    if (errors.length) {
        res.status(500).json({
            success: false,
            errors
        });
    } else {
        User.findOne({ email }, (err, user) => {
            if (err) {
                res.status(500).json({
                    success: false,
                    errors: ['Erro ao recuperar senha']
                })
            } else if (user === null) {
                res.status(500).json({
                    success: false,
                    errors: ['Usuário não encontrado']
                })
            } else {
                const now = new Date();
                const forgotRedirect = new ForgotRedirect({
                    userId: user.id,
                    hash: md5(`${user.id}${now.getTime()}`),
                    datetime: now
                });
                forgotRedirect.save((err2, responseForgot) => {
                    if (err2) {
                        res.status(500).json({
                            success: false,
                            errors: ['Erro ao criar link para recuperar senha']
                        })
                    } else {
                        mailer(
                            req.body.email,
                            'Mygo recuperação de senha',
                            `Link para recuperar a senha: ${config.password_change_url}/${responseForgot.hash}`)
                        res.json({ success: true })
                    }
                })
            }
        });

    }
}

function changePassword(req, res) {
    const { hash, password, confirmPassword } = req.body;
    const errors = [];
    if (!hash) errors.push('Hash é obrigatório');
    if (!password) errors.push('Senha é obrigatória');
    if (!confirmPassword) errors.push('Confirmar senha é obrigatória');
    if (errors.length) {
        res.status(500).json({
            success: false,
            errors
        });
    } else {
        ForgotRedirect.findOne({ hash }, (err, resultForgot) => {
            if (err) {
                res.status(500).json({
                    success: false,
                    errors: ['Erro ao buscar hash']
                });
            } else {
                if (new Date().getTime() - resultForgot.datetime.getTime() > 120000) {
                    res.status(500).json({
                        success: false,
                        errors: ['Link expirado']
                    });
                } else {
                    User.findByIdAndUpdate(resultForgot.userId, { password: md5(password) }, (errUpdate, passwordUpdated) => {
                        if (errUpdate) {
                            res.status(500).json({
                                success: false,
                                errors: ['Erro ao atualizar a senha']
                            });
                        } else {
                            res.json({
                                success: true
                            });
                        }
                    });
                }
            }
        })
    }
}