const express = require('express');
const router = express.Router();
const Country = require('../models/Country.js');

//get all the countries with all the data
router.get('/', (req, res) => {
    Country.find((err, countries) => {
        if (err) return next(err);
        res.json(countries);
    });
});

/*SAVE A TODO*/
router.post('/', (req, res) => {
    ToDo.create(req.body, (err, post) => {
        if (err) return next(err);
        ToDo.find((err, todos) => {
            if (err) return next(err);
            res.json({ todos, success: true, msg: 'Tehtävä lisättiin onnistuneesti!' });
        });
    });
});

module.exports = router;