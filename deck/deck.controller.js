const express = require('express');
const router = express.Router();
const Deck = require('../model/deck');
const User = require('../model/user');

// routes
router.get('/:deckId', getDeck);
router.post('/', insertDeck);
router.put('/:deckId', updateDeck);
router.delete('/:deckId', deleteDeck);

module.exports = router;

function getDeck(req, res) {
    const deckId = req.param('deckId');
    if (!deckId) {
        res.status(500).json({
            success: false,
            errors: ['Id do deck não encontrado']
        });
    } else {
        Deck.findById(deckId, (err, deck) => {
            if (err || !deck) {
                res.status(500).json({
                    success: false,
                    errors: ['Deck não encontrado']
                });
            } else {
                res.json({
                    success: true,
                    deck
                })
            }
        })
    }
}

function insertDeck(req, res) {
    const {
        userId,
        name,
        createdBy,
        main,
        extra,
        side
    } = req.body;
    const errors = [];
    if (!userId) errors.push('Id do usuário é obrigatório');
    if (!name) errors.push('Nome do deck é obrigatório');
    if (!createdBy) errors.push('Nome do criador é obrigatório');
    if (!main) errors.push('Cartas do main deck são obrigatórias')
    else if (!Array.isArray(main)) errors.push('Cartas do main deck devem ser uma lista de inteiros');
    else if (main.some(cardId => !Number.isInteger(cardId))) errors.push('Cartas do main deck devem ser uma lista de inteiros');
    if (!extra) errors.push('Cartas do extra deck são obrigatórias');
    else if (!Array.isArray(extra)) errors.push('Cartas do extra deck devem ser uma lista de inteiros');
    else if (extra.some(cardId => !Number.isInteger(cardId))) errors.push('Cartas do extra deck devem ser uma lista de inteiros');
    if (!side) errors.push('Cartas do side deck são obrigatórias');
    else if (!Array.isArray(side)) errors.push('Cartas do side deck devem ser uma lista de inteiros');
    else if (side.some(cardId => !Number.isInteger(cardId))) errors.push('Cartas do side deck devem ser uma lista de inteiros');
    if (errors.length) {
        res.status(500).json({
            success: false,
            errors
        });
    } else {

        // pesquisando o id do usuario
        User.findById(userId, function (err, user) {
            if (err || !user) {
                res.status(500).json({
                    success: false,
                    errors: ['Usuário não encontrado']
                });
            } else {

                // inserindo deck
                const deck = new Deck({ userId, name, createdBy, main, extra, side });
                deck.save((errDeck, deckInserted) => {
                    if (errDeck) {
                        res.status(500).json({
                            success: false,
                            errors: ['Erro ao salvar o deck']
                        });
                    } else {
                        res.json({
                            success: true,
                            deckInserted
                        });
                    }
                });

            }
        })

    }
}

function updateDeck(req, res) {
    const deckId = req.param('deckId');
    const {
        name,
        createdBy,
        main,
        extra,
        side
    } = req.body;
    const errors = [];
    if (!name) errors.push('Nome do deck é obrigatório');
    if (!createdBy) errors.push('Nome do criador é obrigatório');
    if (!main) errors.push('Cartas do main deck são obrigatórias')
    else if (!Array.isArray(main)) errors.push('Cartas do main deck devem ser uma lista de inteiros');
    else if (main.some(cardId => !Number.isInteger(cardId))) errors.push('Cartas do main deck devem ser uma lista de inteiros');
    if (!extra) errors.push('Cartas do extra deck são obrigatórias');
    else if (!Array.isArray(extra)) errors.push('Cartas do extra deck devem ser uma lista de inteiros');
    else if (extra.some(cardId => !Number.isInteger(cardId))) errors.push('Cartas do extra deck devem ser uma lista de inteiros');
    if (!side) errors.push('Cartas do side deck são obrigatórias');
    else if (!Array.isArray(side)) errors.push('Cartas do side deck devem ser uma lista de inteiros');
    else if (side.some(cardId => !Number.isInteger(cardId))) errors.push('Cartas do side deck devem ser uma lista de inteiros');
    if (errors.length) {
        res.status(500).json({
            success: false,
            errors
        });
    } else {

        // atualizando deck
        Deck.findByIdAndUpdate(deckId, { name, createdBy, main, extra, side }, (errUpdate, deckUpdated) => {
            if (errUpdate) {
                res.status(500).json({
                    success: false,
                    errors: ['Erro ao atualizar o deck']
                });
            } else {
                res.json({
                    success: true
                });
            }
        });

    }
}

function deleteDeck(req, res) {
    const deckId = req.param('deckId');
    Deck.deleteOne({ _id: deckId }, (err, response) => {
        if (err) {
            res.status(500).json({
                success: false,
                errors: ['Erro ao apagar o deck']
            });
        } else {
            res.json({
                success: true
            })
        }
    })
}
