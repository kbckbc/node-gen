const dbFilePath = "/uploads/sqlite.db";
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
const QUERY = require('./dbquery.js');
const tools = require('../lib/tools')
let connection = undefined;

let db = {}

db.conn = function () {
  return new Promise((resolve, reject) => {
    // If db file is created already, then loading the file and return the db 
    // Else creating a db file and a table and return the db
    if(connection == undefined) {
      if (fs.existsSync(dbFilePath)) {
        connection = new sqlite3.Database(dbFilePath, (err) => {
          if(err) {
            return reject(err);
          }
        });
        tools.log(`Connection with SQLite has been established - Get a exist DB, connection [${connection}]`);
      } else {
        connection = new sqlite3.Database(dbFilePath, (err) => {
          if (err) {
            return reject(err);
          }
        });

        // db creation
        connection.exec(QUERY.Item_create);
        connection.exec(QUERY.ItemComment_create);
        connection.exec(QUERY.User_create);
        connection.exec(QUERY.UserReview_create);
        connection.exec(QUERY.Favorite_create);
        
        tools.log('global.UPLOAD_FOLDER', global.UPLOAD_FOLDER);
        tools.log(`Connection with SQLite has been established - New DB creation, connection [${connection}]`);
      }
    }

    return resolve(connection)
  })
}

// close db file and delete it
db.close = function () { 
  return new Promise((resolve, reject) => {
    // close connection
    this.conn().then((para) => {
      para.close((err) => {
        if (err) {
          return reject(err);
        }
        tools.log('db.close(): Close the database connection.');
        
        fs.unlink(dbFilePath, function(err){
          if(err) {
            return reject(err);
          }
          else {
            tools.log('db.close(): file deleted successfully.');
            connection = undefined;
            return resolve(connection);
          }
        }); 
      });
    })
  })
}

module.exports = db;
