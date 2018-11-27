const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//model for the country
const CountrySchema = new Schema({
    name: String,
    countryCode: String,
    data: [{
        //year of the data
        year: Number,
        //population on that year
        population: Number,
        //emissions on that year
        emissions: Number
    }]
});

module.exports = mongoose.model('Country', CountrySchema);