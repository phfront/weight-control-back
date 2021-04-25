const jwt = require('jsonwebtoken');
const md5 = require('md5');
const User = require('../model/user');

const targetWeight = ({ config }, headers, cb) => {
    const { authorization } = headers;
    if (authorization) {
        jwt.verify(authorization.replace('Bearer ', ''), process.env.SECRET, (err, decoded) => {
            // console.log(config);

            // const user = await User.findOne({ _id: decoded.userId });

            // console.log(user);

            // cb({ success: true });

            User.updateOne(
                { _id: decoded.userId },
                { config },
                (err2, person) => {
                    if (err2) {
                        cb({ success: false, errors: ['Erro ao atualizar configuração'] });
                    } else {
                        cb({ success: true, person });
                    }
                }
            );
        })
    } else {
        return cb(500, {
            success: false,
            errors: ['Header inválido']
        });
    }
}

module.exports = {
    authenticate,
    register,
    getUserFromToken,
    getUserIdFromToken,
    targetWeight
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
                            user
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