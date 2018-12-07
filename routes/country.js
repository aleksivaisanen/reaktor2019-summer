const express = require('express');
const router = express.Router();
const Country = require('../models/Country.js');

//get all the countries with all the data
router.get('/countries', (req, res, next) => {
    Country.find((err, countries) => {
        if (err) return next(err);
        res.json(countries);
    });
});

//get all the countries without the data field
router.get('/countries/withoutdata', (req, res, next) => {
    const query = Country.find({}).select('name countryCode -_id');
    query.exec((err, countries) => {
        if (err) return next(err);
        res.json(countries);
    });
});

//get data of a single country based on country code
router.get('/country/:countryCode', (req, res, next) => {
    Country.findOne({ countryCode: req.params.countryCode }, (err, countries) => {
        if (err) return next(err);
        res.json(countries);
    });
});

/*get data of two countries based on country code
for example, data can be used for comparison*/
router.get('/twocountries/code/:countryCode1.:countryCode2', (req, res, next) => {
    Country.find({ $or: [{ countryCode: req.params.countryCode1 }, { countryCode: req.params.countryCode2 }] }, (err, countries) => {
        if (err) return next(err);
        res.json(countries);
    });
});

/*get data of two countries based on country name
for example, data can be used for comparison*/
router.get('/twocountries/name/:name1.:name2', (req, res, next) => {
    Country.find({ $or: [{ name: req.params.name1 }, { name: req.params.name2 }] }, (err, countries) => {
        if (err) return next(err);
        res.json(countries);
    });
});

//get all the country codes
router.get('/countrycodes', (req, res, next) => {
    const query = Country.find({}).select('countryCode -_id');
    query.exec((err, countries) => {
        if (err) return next(err);
        res.json(countries.map(item => item.countryCode));
    });
})

//get all the country names
router.get('/countrynames', (req, res, next) => {
    const query = Country.find({}).select('name -_id');
    query.exec((err, countries) => {
        if (err) return next(err);
        res.json(countries.map(item => item.name));
    });
})

module.exports = router;