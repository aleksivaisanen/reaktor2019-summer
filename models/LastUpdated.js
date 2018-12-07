const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//model for the country
const LastUpdatedSchema = new Schema({
    emissions: Date,
    population: Date
});

module.exports = mongoose.model('LastUpdated', CountrySchema);