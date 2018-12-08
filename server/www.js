/**
 * Module dependencies.
 */

const app = require('./app');
const debug = require('debug')('mean-app:server');
const http = require('http');
const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');
const extract = require('extract-zip');
const Country = require('../models/Country.js');


/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || '8080');
app.set('port', port);

//connect to db
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
mongoose.connect('mongodb://localhost:27017/reaktor2019-summer', { promiseLibrary: require('bluebird') })
  .then(() => {
    console.log('Connection to DB successful!')
    //get the population csv
    populateDB("http://api.worldbank.org/v2/en/indicator/SP.POP.TOTL?downloadformat=csv", "./data/population-api.zip", "population");
  })
  .catch((err) => console.error(err));



//TODO error handling
//////////////////////////////////////////

//TODO autoupdating db every week


//function for populating the db
function populateDB(getUrl, destUri, type) {
  console.log("Get request to:", getUrl)
  //downloads the population zip from the worldbank api to the data directory
  const location = path.join(__dirname, "/../data");
  const file = fs.createWriteStream(destUri);
  http.get(getUrl, function (response) {
    response.pipe(file);
    file.on('finish', function () {
      file.close(function () {
        //unzip the contents to data folder after file has been loaded and closed
        extract(destUri, { dir: location }, function (err) {
          // handle error

          fs.readdir(location, function (err, items) {
            if (err) {
              console.error("Error reading directory:", err);
            }
            //after first iteration, call the same function ass callback
            let filename = ""
            //ensure that we access the right csv
            if (type == "population") {
              filename = items.find(function (item) {
                return item.includes("API_SP.POP.TOTL")
              })
            } else {
              filename = items.find(function (item) {
                return item.includes("API_EN.ATM.CO2E")
              })
            }
            queryDocuments(path.join(location, filename),
              type,
              function () {
                populateDB("http://api.worldbank.org/v2/en/indicator/EN.ATM.CO2E.KT?downloadformat=csv",
                  "./data/emissions-api.zip", "emissions")
              }
            );
          })
        })
      });
    });
  });
}


function queryDocuments(uri, type, cb) {
  //if db is still empty
  let dbEmpty = false;
  //variable for db data;
  let dbDocuments = [];
  //get all documents from db and save them to array
  //also turn the mongoose model to js object
  Country.find().lean().exec(function (err, countries) {
    if (err) { console.error("Something went wrong when accessing documents from db.", err) }
    else if (countries.length === 0) {
      console.log("Database is empty, populating database...");
      dbEmpty = true;
      readCSV(uri, type, dbEmpty, dbDocuments, cb);
    }
    else {
      console.log("Documents queried, checking data...");
      dbDocuments = countries;
      readCSV(uri, type, dbEmpty, dbDocuments, cb);
    }
  })
}

//read the csv file

function readCSV(uri, type, dbEmpty, dbDocuments, cb) {
  //variable to check the header row 
  let firstCorrect = 0;
  //array to save the corresponging column index with the year
  let indexToYear = [];
  //data of the current country 
  let country;
  //let's read the csv 
  csv
    .fromPath(uri)
    .on("data", function (data) {
      //if row's length greater than 4, we have found our header row
      if (data.length > 4) {
        firstCorrect++;
      }
      //save the index with the right year to the array
      if (firstCorrect == 1) {
        for (let i = 0; i < data.length; i++) {
          indexToYear.push({
            index: i,
            year: data[i]
          })
        }
      }
      else if (firstCorrect > 1) {
        //try to find the first element of the filtered list based on country code
        if (dbDocuments.length > 0) {
          country = dbDocuments.find(function (element) {
            return element.countryCode === data[1];
          });
        }

        //if there is no db entry of the current country, let's add it.
        if (!country) {
          //data starts after the header row
          let countryObject = {
            name: data[0],
            countryCode: data[1],
            data: []
          }
          //years start at index 4
          for (let i = 4; i < data.length; i++) {
            let obj = {}
            obj.year = indexToYear[i].year;
            obj[type] = data[i];
            countryObject.data.push(obj);
          }
          //save the country to dbDocuments
          dbDocuments.push(countryObject);
        }
        //if a db entry is found, validate the data
        else if (!dbEmpty && country) {
          //let's create a copy of the returned object
          let countryCopy = Object.assign({}, country);
          //checks if data has been assigned to entry
          //type is either "emissions" or "population"
          if (countryCopy.data[0].hasOwnProperty(type)) {
            //checks that the values are correct
            let valuesUpdated = false;
            for (let i = 0; i < countryCopy.data.length; i++) {
              const correctIndexForYear = indexToYear.find(function (obj) {
                return Number(obj.year) === countryCopy.data[i].year
              });
              //if no correct index is found, aka filter returns array with length 0
              if (correctIndexForYear.length === 0) {
                console.log("Something is wrong with the indexToYear array.")
              }
              //if data is correct, continue
              else if (countryCopy.data[i][type] === Number(data[correctIndexForYear.index])) {
                //data is correct
                continue;
              }
              else {
                //data is not correct
                //update the data
                countryCopy.data[i] = Object.assign({}, countryCopy.data[i], data[correctIndexForYear.index]);
                valuesUpdated = true;
              }
            }
            //if we updated the values, update the dbDocuments array
            if (valuesUpdated) {
              for (let i = 0; i < dbDocuments.length; i++) {
                if (dbDocuments[i].countryCode === countryCopy.countryCode) {
                  dbDocuments[i] = countryCopy;
                }
              }
            }
          }
          //entry doesn't have the current property, so let's add it  
          else {
            //for loop goes through every element in the data array
            for (let i = 0; i < countryCopy.data.length; i++) {
              const correctIndexForYear = indexToYear.find(function (obj) {
                return Number(obj.year) === countryCopy.data[i].year
              });
              countryCopy.data[i][type] = data[correctIndexForYear.index]
            }
            //update the entry
            for (let i = 0; i < dbDocuments.length; i++) {
              if (dbDocuments[i].countryCode === countryCopy.countryCode) {
                dbDocuments[i] = countryCopy;
              }
            }
          }
        }
      }
    })
    .on("end", function () {
      if (dbEmpty) {
        Country.insertMany(dbDocuments, function (err) {
          if (err) {
            console.error("Something went wrong when inserting to db:", err)
          } else {
            console.log("First insertion to db done.");
            if (type === "population") {
              cb();
            }
          }
        })
      } else {
        dbDocuments.forEach(function (country, i, array) {
          Country.update({ "_id": country._id }, { "$set": { "data": country.data } }, function (err) {
            if (err) {
              console.error("Something went wrong when inserting to db:", err)
            }
            else {
              //otherwise success
              //callback if only the first csv-file has been gone through
              if (type === "population" && i === array.length - 1) {
                cb();
              } else if (type === "emissions" && i === array.length - 1) {
                console.log("DB operations are done!")
                console.log("WOHOO")
              }
            }
          }
          )
        }
        )
      }
    });
}


/**
 * Create HTTP server.
 */

const server = http.createServer(app);

app.use((req, res, next) => {
  var reqType = req.headers["x-forwarded-proto"];
  reqType === "https" ? next() : res.redirect("https://" + req.headers.host + req.url)
})


/**
 * Listen on provided port, on all network interfaces.
 */

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}