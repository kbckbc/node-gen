const express = require('express');
const { checkCSRF } = require('../lib/tools');
const router = express.Router();
const tools = require('../lib/tools')
const db = require("../dblib/dbconn");
const QUERY = require('../dblib/dbquery.js');
  
router.post('/signup', function(req, res, next) {
  tools.log('/signup', 'req.body', req.body);

  // prepare user data
  let data = req.body;
  data.joindate = Date.now();

  var bcrypt = require('bcryptjs');
  bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(data.password, salt, function(err, hash) {
          data.password = hash;
      });
  });

  tools.log('/signup', 'data', data);
  tools.log('/signup', 'QUERY.User_select', QUERY.User_select);
  tools.log('/signup', 'req.body.username', req.body.username);

  db.conn().then((conn) => {
    conn.all(QUERY.User_select, [req.body.username], (err, rows) => {
      tools.log('/signup', 'data111111111111', data);
      if (err) {
        throw new Error(err.message);
      }

      tools.log('/signup', 'data1111111222222222', data);
      if( rows.length != 0 ) {
        tools.log(`The Username '${req.body.username}' is in use. Try another one again!`);
        res.json({ret:0,msg:`The Username '${req.body.username}' is in use. Try another one again!`});
      }
      else {

        db.conn().then((conn) => {
          conn.run(QUERY.User_insert, [data.username, data.password, data.email, data.myschool, data.joindate ], (err) => {
            if (err) {
              console.error(err.message);
            }
            res.json({ret:1,msg:'sign succ'});
          });
        }).catch((e) => {
          console.error(e.message); // "oh, no!"
        })        
      }
    });
  }).catch((e) => {
    console.error(e.message); // "oh, no!"
  })  
  
});

router.post('/passwordChange', function(req, res, next) {
  // tools.log('auth', '/passwordChange', 'req.body', req.body);

  // CSRF check
  csrf = checkCSRF(req.body.csrf, req.user.csrf);
  if( csrf.ret == 0) {
    res.json(csrf);
    return;
  }

  // prepare user data
  let data = req.body;

  var bcrypt = require('bcryptjs');
  bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(data.password, salt, function(err, hash) {
          data.password = hash;
      });
  });

  db.conn().then((conn) => {
    conn.all(QUERY.User_select, [req.body.username], (err, rows) => {
      if (err) {
        throw new Error(err.message);
      }
      if( rows.length == 0 ) {
        res.json({ret:0,msg:`The Username '${req.body.username}' not found.`});
      }
      else {

        db.conn().then((conn) => {
          conn.run(QUERY.User_update_passwd, [data.password, data.password, data.username], (err) => {
            if (err) {
              return new Error(err.message);
            }
            tools.log('passwordChange succ');
            res.json({ret:1,msg:'passwordChange succ'});
          });
        }).catch((e) => {
          console.error(e.message); // "oh, no!"
        }) 
      }
    });
  }).catch((e) => {
    console.error(e.message); // "oh, no!"
  })  
});  


router.post('/schoolChange', function(req, res, next) {
  tools.log('user', '/schoolChange', 'req.body', req.body);

  // CSRF check
  csrf = checkCSRF(req.body.csrf, req.user.csrf);
  if( csrf.ret == 0) {
    res.json(csrf);
    return;
  }

  db.conn().then((conn) => {
    conn.all(QUERY.User_select, [req.user.username], (err, rows) => {
      if (err) {
        throw new Error(err.message);
      }
      if( rows.length == 0 ) {
        res.json({ret:0,msg:`The Username '${req.user.username}' not found.`});
      }
      else {

        db.conn().then((conn) => {
          conn.run(QUERY.User_update_school, [req.body.myschool, req.user.username], (err) => {
            if (err) {
              return new Error(err.message);
            }
            tools.log('schoolChange succ');
            req.user.myschool = req.body.myschool;
            res.json({ret:1,msg:'schoolChange succ'});
          });
        }).catch((e) => {
          console.error(e.message); // "oh, no!"
        }) 
      }
    });
  }).catch((e) => {
    console.error(e.message); // "oh, no!"
  })   
}); 

module.exports = router;