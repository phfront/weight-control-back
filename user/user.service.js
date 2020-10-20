const config = require('config.json');
const jwt = require('jsonwebtoken');
const md5 = require('md5');
const { db } = require('../model/user');
const User = require('../model/user');

module.exports = {
    authenticate,
    getAll,
    register
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
                const token = jwt.sign({ sub: user._id }, config.secret, { expiresIn: '7d' });
                cb({ token })
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

// helper functions

function omitPassword(user) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
}