#!/usr/bin/env node

/**
 * Module dependencies.
 */

const app = require('../app');
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
    console.log('connection successful')
    populateDB();
  })
  .catch((err) => console.error(err));



//TODO error handling
//////////////////////////////////////////



//function for populating the db
function populateDB() {
  //downloads the population zip from the worldbank api to the data directory
  const uri = "./data/population-api.zip";
  const file = fs.createWriteStream(uri);
  http.get("http://api.worldbank.org/v2/en/indicator/SP.POP.TOTL?downloadformat=csv", function (response) {
    response.pipe(file);
    file.on('finish', function () {
      file.close(function () {
        //unzip the contents to data folder after file has been loaded and closed
        extract(uri, { dir: path.join(__dirname, "/../data") }, function (err) {
          // handle error
          console.error(err);

          fs.readdir(location2, function (err, items) {
            readCSV(path.join(location2, items[1]), "population");
          })
        })
      });
    });
  });


  //downloads the CO2 emissions zip from the worldbank api to the data directory
  const destUri = "./data/emissions-api.zip";
  const location2 = path.join(__dirname, "/../data");
  const file2 = fs.createWriteStream(destUri);
  http.get("http://api.worldbank.org/v2/en/indicator/EN.ATM.CO2E.KT?downloadformat=csv", function (response) {
    response.pipe(file2);
    file2.on('finish', function () {
      file2.close(function () {
        //unzip the contents to data folder after file has been loaded and closed
        extract(destUri, { dir: location2 }, function (err) {
          // handle error
          console.error(err);

          fs.readdir(location2, function (err, items) {
            readCSV(path.join(location2, items[0]), "emissions");
          })

        })
      });
    });
  });
}
//read the csv file

function readCSV(uri, type) {
  //variable to check the header row 
  let firstCorrect = 0;
  //array to save the corresponging column index with the header
  let indexToHeader = [];
  //let's read the csv file
  csv
    .fromPath(uri)
    .on("data", function (data) {
      //first try to find an existing entry if first csv-file has already been gone through

      // CONTINUE HERE!!!!!!!!!!
      Country.findOne({ countryCode: data[1] }, function (err, country) {
        console.log(country);
      });

      //if row's length greater than 4, we have found our header row
      if (data.length > 4) {
        firstCorrect++;
      }
      //save the index with the right header to the array
      if (firstCorrect == 1) {
        for (var i = 0; i < data.length; i++) {
          indexToHeader.push({
            index: i,
            header: data[i]
          })
        }
      }
      //data starts after the header row
      if (firstCorrect > 1) {
        let countryObject = {
          name: data[0],
          countryCode: data[1],
          data: []
        }
        //we don't need data[2] and data[3], because the years start at index 4
        for (var i = 4; i < data.length; i++) {
          if (type === "emissions") {
            countryObject.data.push({
              year: indexToHeader[i].header,
              emissions: data[i]
            })
          } else if (type === "population") {
            //countryObject.data.push({})
          }
        }
        //console.log(countryObject)
        //save the country to mongodb
        Country.create(countryObject, function (err, country) {
          if (err) return next(err);
          // saved!
        });
      }
    })
    .on("end", function () {
      //console.log(indexToHeader);
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