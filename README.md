# Reaktor 2019 summer job challenge
Fullstack app with MERN

Author: Aleksi Väisänen

## GET request models
```
All responses will be in JSON format

/countries

- returns all the data of every country
- response size over 1 MB, may take some time so be careful

/countries/withoutdata

- returns only the name and the country code of the countries


/country/:countryCode

- replace ':countryCode' with any country code and response will be the data of that country
- for example /country/FIN returns data of Finland

/twocountries/code/:countryCode1.:countryCode2

- replace ':countryCode1' and ':countryCode2' with any country code and response will be the data of those two countries
- for example /country/FIN.SWE returns data of Finland and Sweden
- takes only two parameters, countryCode1 and countryCode2

/twocountries/name/:name1.:name2

- replace ':name1' and ':name2' with any country name and response will be the data of those two countries
- for example /country/Finland.Sweden returns data of Finland and Sweden
- takes only two parameters, name1 and name2

/countrycodes

- returns all the country codes in a single array

/countrynames

-returns all the country names in a single array



