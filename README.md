# Reaktor 2019 summer job challenge
Fullstack app with MERN stack

Author: Aleksi Väisänen

## GET request models
All responses will be in JSON format
```
/countries

- returns all the data of every country
- response size over 1 MB, may take some time so be careful

/countries/withoutdata

- returns only the name and the country code of the countries


/country/code/:countryCode

- replace ':countryCode' with any country code and response will be the data of that country
- for example /country/code/FIN returns data of Finland in a single JSON object
- you can get multiple countries at once with '+'-sign
- for example /country/code/FIN+SWE+RUS returns data of Finland, Sweden and Russia in an array of JSON objects
- results will be in alphabetical order based on country code 
- number of countries you can get at once is unlimited

/country/name/:name

- replace ':name' with any country name and response will be the data of that country (empty spaces have to be '_')
- for example /country/name/Finland returns data of Finland in a single JSON object
- you can get multiple countries at once with '+'-sign
- for example /country/name/Finland+Sweden+Russian_Federation returns data of Finland, Sweden and Russia in an array of JSON objects
- results will be in alphabetical order based on country code
- number of countries you can get at once is unlimited


/countrycodes

- returns all the country codes in a single array

/countrynames

-returns all the country names in a single array



