const dbFilePath = "./sqlite.db";
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
const SQL = require('./dbquery.js');
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
        console.log(`Connection with SQLite has been established - Get a exist DB, connection [${connection}]`);
      } else {
        connection = new sqlite3.Database(dbFilePath, (err) => {
          if (err) {
            return reject(err);
          }
        });

        // db creation
        connection.exec(SQL.item_create);
        connection.exec(SQL.item_comment_create);
        connection.exec(SQL.user_create);
        connection.exec(SQL.user_review_create);
        
        console.log(`Connection with SQLite has been established - New DB creation, connection [${connection}]`);
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
        console.log('db.close(): Close the database connection.');
        
        fs.unlink(dbFilePath, function(err){
          if(err) {
            return reject(err);
          }
          else {
            console.log('db.close(): file deleted successfully.');
            connection = undefined;
            return resolve(connection);
          }
        }); 
      });
    })
  })
}

module.exports = db;
