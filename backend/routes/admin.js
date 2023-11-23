const express = require('express');
const router = express.Router();
const tools = require('../lib/tools')
const db = require("../dblib/dbconn");
const QUERY = require('../dblib/dbquery.js');
const fs = require("fs");
const path = require('path');

// This page is for init the app and handle the db

router.get('/', (req, res) => {
  tools.log('admin', '/', '__dirname', __dirname);

  res.sendFile(path.join(__dirname, 'admin.html'));
});

// This page is for administrate for this site
router.get('/dbinit', function(req, res, next) {
  tools.log('admin', '/dbinit', 'req.body', req.body);

  db.close().then((conn) => {
    const targetPath = global.UPLOAD_FOLDER;

    //passsing directoryPath and callback function
    fs.readdir(targetPath, function (err, files) {
        //handling error
        if (err) {
            return tools.log('Unable to scan directory: ' + err);
        } 
        //listing all files using forEach
        files.forEach(function (file) {
            let fullPath = path.join(targetPath, file);
            tools.log('admin', '/dbinit', 'targetFile', path.join(targetPath, file));

            fs.unlink(fullPath, (err) => {
              if (err) {
                  throw err;
              }
          });            
        });
    });

    res.send('DB init completed.');
  }).catch((e) => {
    console.error(e.message); // "oh, no!"
  })
});

router.get('/dbopen', function(req, res, next) {
  tools.log('admin', '/dbopen', 'req.body', req.body);

  db.conn().then((conn) => {
    tools.log('admin', '/dbopen', 'conn', conn);
    res.send('DB open completed.');
  }).catch((e) => {
    console.error(e.message); // "oh, no!"
  })
});

router.get('/User_insert', function(req, res, next) {
  tools.log('admin', '/User_insert', 'req.body', req.body);
  tools.log('admin', '/User_insert', 'QUERY.User_insert', QUERY.User_insert);

  db.conn().then((conn) => {
    conn.run(QUERY.User_insert, ['aaa','aaa','aaa@aaa.aaa','Washu',1], (err) => {
      if (err) {
        console.error(err.message);
      }
      tools.log(`Inserted a row with the ID: ${this.lastID}`);

      res.send(JSON.stringify({lastID:this.lastID}));
    });
  }).catch((e) => {
    console.error(e.message); // "oh, no!"
  })
});


router.get('/User', function(req, res, next) {
  tools.log('admin', '/User', 'req.query', req.query);
  tools.log('admin', '/User', 'QUERY.User_select', QUERY.User_select);

  db.conn().then((conn) => {
    conn.all(QUERY.User_select, [req.query.username], (err, rows) => {
      if (err) {
        throw new Error(err.message);
      }
      tools.log(`rows ${rows}`)
      if( rows.length == 0 ) {
        tools.log(`empty`);
      }
      else {
        rows.forEach((row) => {
          tools.log(`${row.name}: ${row.age}`);
        });
      }
  
      tools.log(`rows [${rows}]`, JSON.stringify(rows));
  
      res.send(JSON.stringify(rows));
    });
  }).catch((e) => {
    console.error(e.message); // "oh, no!"
  })
});

router.get('/Item_insert', function(req, res, next) {
  tools.log('admin', '/Item_insert', 'req.body', req.body);
  tools.log('admin', '/Item_insert', 'QUERY.Item_insert', QUERY.Item_insert);

  db.conn().then((conn) => {
    conn.run(QUERY.Item_insert, ['Cup','1',10,'WashuKansas City University','lib','good','image', 'bbb',1,0,''], (err) => {
      if (err) {
        console.error(err.message);
      }
      tools.log(`Inserted a row with the ID: ${this.lastID}`);

      res.send(JSON.stringify({lastID:this.lastID}));
    });
  }).catch((e) => {
    console.error(e.message); // "oh, no!"
  })
});

router.get('/Item', function(req, res, next) {
  tools.log('admin', '/Item', 'req.query', req.query);
  tools.log('admin', '/Item', 'QUERY.Item_select', QUERY.Item_select);

  db.conn().then((conn) => {
    conn.all(QUERY.Item_select, [null, 0,99999], (err, rows) => {
      if (err) {
        throw new Error(err.message);
      }
      tools.log(`rows ${JSON.stringify(rows)}`)

      res.send(JSON.stringify(rows));
    });
  }).catch((e) => {
    console.error(e.message); // "oh, no!"
  })
});

module.exports = router;