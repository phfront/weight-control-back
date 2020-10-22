const jwt = require('jsonwebtoken');
const md5 = require('md5');
const User = require('../model/user');

module.exports = {
    authenticate,
    getAll,
    register,
    getUserFromToken,
    getUserIdFromToken
};

function authenticate({ username, password }, cb) {
    const errors = [];
    if (!username) errors.push('Usuário obrigatório');
    if (!password) errors.push('Senha obrigatória');
    if (errors.length) {
        cb({
            success: false,
            errors
        });
    } else {
        User.findOne({ username, password: md5(password) }, function (err, user) {
            if (err || !user) {
                cb({
                    success: false,
                    errors: ['Usuário não encontrado, verifique usuário e senha informados']
                })
            } else {
                const token = jwt.sign({ userId: user._id }, process.env.SECRET, { expiresIn: '7d' });
                cb({ success: true, token })
            }
        });
    }
}

async function getAll() {
    return users.map(u => omitPassword(u));
}

async function register(user) {
    const errors = [];
    if (!user.name) errors.push('Nome obrigatório');
    if (!user.email) errors.push('Email obrigatório');
    if (!user.username) errors.push('Username obrigatório');
    if (!user.password) errors.push('Senha obrigatória');
    if (errors.length) {
        return {
            success: false,
            errors
        }
    } else {
        User.find({}, function (err, users) {
            return {
                err, users
            }
        })
        user.password = md5(user.password);
        return {
            success: true,
            user
        }
    }
}

function getUserFromToken(headers, cb) {
    const { authorization } = headers;
    if (authorization) {
        jwt.verify(authorization.replace('Bearer ', ''), process.env.SECRET, (err, decoded) => {
            if (err) {
                cb(500, {
                    success: false,
                    errors: ['Token inválido'],
                })
            } else {
                User.findById(decoded.userId, (err2, user) => {
                    if (err2 || !user) {
                        cb(500, {
                            success: false,
                            errors: ['Usuário não encontrado']
                        })
                    } else {
                        cb(200, {
                            success: true,
                            user: {
                                _id: user._id,
                                name: user.name,
                                email: user.email,
                                username: user.username,
                                theme: user.theme,
                            }
                        });
                    }
                });
            }
        })
    } else {
        return cb(500, {
            success: false,
            errors: ['Header inválido']
        });
    }
}

function getUserIdFromToken(headers, cb) {
    const { authorization } = headers;
    if (authorization) {
        jwt.verify(authorization.replace('Bearer ', ''), process.env.SECRET, (err, decoded) => {
            if (err) {
                cb(500, {
                    success: false,
                    errors: ['Token inválido'],
                })
            } else {
                cb(200, {
                    success: true,
                    userId: decoded.userId
                })
            }
        })
    } else {
        return cb(500, {
            success: false,
            errors: ['Header inválido']
        });
    }
}

// helper functions

function omitPassword(user) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
}