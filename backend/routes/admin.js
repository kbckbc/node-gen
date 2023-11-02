const express = require('express');
const router = express.Router();
const tools = require('../lib/tools')
const db = require("../dblib/dbconn");
const QUERY = require('../dblib/dbquery.js');
  
router.get('/init', function(req, res, next) {
  console.log('admin', '/init', 'req.body', req.body);

  db.close().then((conn) => {
    console.log('yay:', conn);
    // db.conn();
    res.send('DB init completed.');
  }).catch((e) => {
    console.error(e.message); // "oh, no!"
  })
});

router.get('/insert_user', function(req, res, next) {
  console.log('admin', '/insert_user', 'req.body', req.body);
  console.log('admin', '/insert_user', 'QUERY.user_insert', QUERY.user_insert);

  db.conn().then((conn) => {
    conn.run(QUERY.user_insert, ['aaa','aaa','aaa@aaa.aaa','Washu',1], (err) => {
      if (err) {
        console.error(err.message);
      }
      console.log(`Inserted a row with the ID: ${this.lastID}`);

      res.send(JSON.stringify({lastID:this.lastID}));
    });
  }).catch((e) => {
    console.error(e.message); // "oh, no!"
  })
});


router.get('/select_user', function(req, res, next) {
  console.log('admin', '/select_user', 'req.body', req.body);
  console.log('admin', '/select_user', 'QUERY.item_select', QUERY.user_select);

  db.conn().then((conn) => {
    conn.all(QUERY.user_select, [], (err, rows) => {
      if (err) {
        throw new Error(err.message);
      }
      console.log(`rows ${rows}`)
      if( rows.length == 0 ) {
        console.log(`empty`);
      }
      else {
        rows.forEach((row) => {
          console.log(`${row.name}: ${row.age}`);
        });
      }
  
      console.log(`rows [${rows}]`, JSON.stringify(rows));
  
      res.send(JSON.stringify(rows));
    });
  }).catch((e) => {
    console.error(e.message); // "oh, no!"
  })
});

module.exports = router;