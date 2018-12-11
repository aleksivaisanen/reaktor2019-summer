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

//get data of a single or multiple countries based on country code
router.get('/country/code/:countryCode', (req, res, next) => {
    //change the :countryCode parameter to usable mongoose query
    let countries = req.params.countryCode.split("+");
    countries = countries.map(code => Object.assign({}, { "countryCode": code }));
    if (countries.length <= 1) {
        Country.findOne(countries[0], (err, countries) => {
            if (err) return next(err);
            res.json(countries);
        });
    } else {
        Country.find({ $or: countries }, (err, countries) => {
            if (err) return next(err);
            res.json(countries);
        });
    }
});


//get data of a single or multiple countries based on country name
router.get('/country/name/:name', (req, res, next) => {
    //change the :name parameter to usable mongoose query
    let countries = req.params.name.split("_").join(" ");
    countries = countries.split("+");
    countries = countries.map(name => Object.assign({}, { "name": name }));
    if (countries.length <= 1) {
        Country.findOne(countries[0], (err, countries) => {
            if (err) return next(err);
            res.json(countries);
        });
    } else {
        Country.find({ $or: countries }, (err, countries) => {
            if (err) return next(err);
            res.json(countries);
        });
    }
});

//get all the country codes in a single array
router.get('/countrycodes', (req, res, next) => {
    const query = Country.find({}).select('countryCode -_id');
    query.exec((err, countries) => {
        if (err) return next(err);
        res.json(countries.map(item => item.countryCode));
    });
})

//get all the country names in a single array
router.get('/countrynames', (req, res, next) => {
    const query = Country.find({}).select('name -_id');
    query.exec((err, countries) => {
        if (err) return next(err);
        res.json(countries.map(item => item.name));
    });
})

module.exports = router;