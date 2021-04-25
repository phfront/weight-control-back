const jwt = require('jsonwebtoken');
const md5 = require('md5');
const Model = require('../model/weight');

const create = ({ weights, datetime }, headers, cb) => {
    const { authorization } = headers;
    if (authorization) {
        jwt.verify(authorization.replace('Bearer ', ''), process.env.SECRET, (err, decoded) => {
            if (err) {
                cb({ success: false, errors: ['Token inválido'] });
            } else {
                Model.collection.insertMany(weights, (err2, items) => {
                    if (err2) {
                        cb({ success: false, errors: ['Erro ao inserir pesos'] });
                    } else {
                        cb({ success: true, items });
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

const list = (headers, cb) => {
    const { authorization } = headers;
    if (authorization) {
        jwt.verify(authorization.replace('Bearer ', ''), process.env.SECRET, (err, decoded) => {
            Model.find({}).sort({ datetime: 1 }).exec((err2, weights) => {
                if (err2) {
                    cb({ success: false, errors: ['Erro ao buscar pesos'] });
                } else {
                    cb({ success: true, weights });
                }
            });
        })
    } else {
        return cb(500, {
            success: false,
            errors: ['Header inválido']
        });
    }
}

const remove = ({ weightId }, cb) => {
    Model.remove({ _id: weightId }, (err, response) => {
        if (err) {
            cb({ success: false, errors: ['Erro ao remover peso'] });
        } else {
            cb({ success: true });
        }
    })
}

module.exports = {
    create,
    list,
    remove
};
