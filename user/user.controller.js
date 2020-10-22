const express = require('express');
const router = express.Router();
const userService = require('./user.service');
const User = require('../model/user');
const Deck = require('../model/deck');
const MyCards = require('../model/mycards');
const ForgotRedirect = require('../model/forgotRedirect');
const md5 = require('md5');
const mailer = require('../service/mailer');
const jwt = require('jsonwebtoken');

// routes
router.post('/register', register);
router.post('/authenticate', authenticate);
router.get('/', getAll);
router.get('/deck', getDecks);
router.get('/mycards', getMyCards);
router.put('/mycards', updateMyCards);
router.post('/forgotpassword', forgotPassword);
router.post('/changepassword', changePassword);
router.get('/verifyToken', verifyToken);
router.get('/info', userInfo);
router.put('/theme', setTheme);

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

function verifyToken(req, res) {
    const { authorization } = req.headers;
    if (authorization) {
        jwt.verify(authorization.replace('Bearer ', ''), process.env.SECRET, (err, decoded) => {
            if (err) {
                res.status(500).json({
                    success: false,
                    errors: ['Token inválido']
                })
            } else {
                res.json({ success: true })
            }
        })
    } else {
        res.status(500).json({
            success: false,
            errors: ['Nenhum token presente no header']
        })
    }
}

function userInfo(req, res) {
    userService.getUserFromToken(req.headers, (status, ret) => {
        res.status(status).send(ret);
    })
}

function getAll(req, res, next) {
    userService.getAll()
        .then(users => res.json(users))
        .catch(next);
}

function getDecks(req, res) {
    userService.getUserIdFromToken(req.headers, (status, ret) => {
        if (status === 200) {
            Deck.find({ userId: ret.userId }, (err, decks) => {
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
        } else {
            res.status(status).send(ret);
        }
    })
}

function updateMyCards(req, res) {
    const { cards } = req.body;
    const errors = [];
    if (!cards) errors.push('Lista de cartas são obrigatórias')
    if (errors.length) {
        res.status(500).json({
            success: false,
            errors
        });
    } else {
        userService.getUserIdFromToken(req.headers, (status, ret) => {
            if (status === 200) {
                MyCards.findOne({ userId: ret.userId }, (err, myCards) => {
                    if (err) {
                        res.status(500).json({
                            success: false,
                            errors: ['Error ao salvar cartas']
                        })
                    } else {
                        cards.forEach(card => {
                            const existCard = myCards.cards.find(c => c.id === card.id);
                            if (existCard) {
                                if (card.count <= 0) {
                                    myCards.cards = myCards.cards.filter(c => c.id !== card.id)
                                } else {
                                    existCard.count = card.count;
                                }
                            } else {
                                myCards.cards.push(card);
                            }
                        })
                        myCards.update({ cards: myCards.cards }, (err2, update) => {
                            if (err2) {
                                res.status(500).json({
                                    success: false,
                                    errors: ['Error ao salvar cartas']
                                })
                            } else {
                                res.json({
                                    success: true
                                })
                            }
                        })
                    }
                })
            } else {
                res.status(status).send(ret);
            }
        })
    }
}

function getMyCards(req, res) {
    userService.getUserIdFromToken(req.headers, (status, ret) => {
        if (status === 200) {
            MyCards.findOne({ userId: ret.userId }, (err, cards) => {
                if (err) {
                    res.status(500).json({
                        success: false,
                        errors: ['Error ao buscar cartas']
                    })
                } else {
                    res.json({
                        success: true,
                        cards: cards.cards
                    })
                }
            })
        } else {
            res.status(status).send(ret);
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
                    res.status(500).json({ success: false, errors: ['Já existe um usuário com esse email'] });
                } else if (users.find(user => user.username === username)) {
                    res.status(500).json({ success: false, errors: ['Já existe um usuário com esse username'] });
                } else {
                    const user = new User({ name, email, username, password: md5(password), theme: 'yugi' });
                    user.save((err2, person) => {
                        if (err2) {
                            res.status(500).send({ success: false, errors: ['Erro ao registrar o usuário'] });
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
                            `Link para recuperar a senha: ${process.env.PASSWORD_CHANGE_URL}${responseForgot.hash}`)
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
    if (password && confirmPassword && password !== confirmPassword) {
        errors.push('As senhas são diferentes');
    }

    if (errors.length) {
        res.status(500).json({
            success: false,
            errors
        });
    } else {
        ForgotRedirect.findOne({ hash }, (err, resultForgot) => {
            if (err || !resultForgot) {
                res.status(500).json({
                    success: false,
                    errors: ['Link inválido']
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

function setTheme(req, res) {
    const { theme } = req.body;
    userService.getUserIdFromToken(req.headers, (status, ret) => {
        if (status === 200) {
            User.findByIdAndUpdate(ret.userId, { theme }, (err, user) => {
                if (err) {
                    res.status(500).json({
                        success: false,
                        errors: ['Error ao atualizar tema']
                    })
                } else {
                    res.json({
                        success: true
                    })
                }
            });
        } else {
            res.status(status).send(ret);
        }
    })
}
