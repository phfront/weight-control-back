const express = require('express');
const router = express.Router();
const MyCards = require('../model/mycards');

router.get('/:userId', getCards);

module.exports = router;

function getCards(req, res, next) {
    const userId = req.param('userId');
    MyCards.findOne({ userId }, (err, cards) => {
        if (err) {
            res.status(500).json({
                success: false,
                errors: ['Erro ao buscar cartas']
            });
        } else {
            res.json({
                success: false,
                cards: cards.cards
            })
        }
    })
}
