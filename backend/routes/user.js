const express = require('express');
const { checkCSRF } = require('../lib/tools');
const router = express.Router();
const tools = require('../lib/tools')
  
router.post('/signup', function(req, res, next) {
  console.log('auth', '/signup', 'req.body', req.body);

  // prepare user data
  let data = req.body;
  data.joindate = Date.now();

  var bcrypt = require('bcryptjs');
  bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(data.password, salt, function(err, hash) {
          data.password = hash;
      });
  });

  tools.getDb('user')
    .then((coll) => {
      coll.findOne({"username":req.body.username})
        .then(result => {
          if( result != null ) {
            console.log(`The Username '${req.body.username}' is in use. Try another one again!`);
            res.json({ret:0,msg:`The Username '${req.body.username}' is in use. Try another one again!`});
          }
          else {
            coll.insertOne(data)
              .then(result => {
                console.log('insertOne', result);
                // res.render('signup_re', {"result":1, "msg":"Your account has been created!"});
                res.json({ret:1,msg:'sign succ'});
              })
          }
        })
        .catch(err => console.log(err));
    })    
    .catch(err => console.log(err));     
});

router.post('/passwordChange', function(req, res, next) {
  // console.log('auth', '/passwordChange', 'req.body', req.body);

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

  tools.getDb('user')
    .then((coll) => {
      coll.findOne({"username":req.body.username})
        .then(result => {
          if( result == null ) {
            res.json({ret:0,msg:`The Username '${req.body.username}' not found.`});
          }
          else {
            coll.updateOne({username:data.username},{$set:{password:data.password}})
            .then(result => {
              console.log('updateOne', result);
              res.json({ret:1,msg:'passwordChange succ'});
            })
          }
        })
        .catch(err => console.log(err));
    })    
    .catch(err => console.log(err));     
});  

router.post('/schoolChange', function(req, res, next) {
  console.log('user', '/schoolChange', 'req.body', req.body);

  // CSRF check
  csrf = checkCSRF(req.body.csrf, req.user.csrf);
  if( csrf.ret == 0) {
    res.json(csrf);
    return;
  }

  // prepare user data
  let data = req.body;

  tools.getDb('user')
    .then((coll) => {
      coll.findOne({"username":req.user.username})
        .then(result => {
          if( result == null ) {
            res.json({ret:0,msg:`The Username '${req.body.username}' not found.`});
          }
          else {
            coll.updateOne({username:req.user.username},{$set:{mySchool:data.mySchool}})
            .then(result => {
              console.log('updateOne', result);
              req.user.mySchool = data.mySchool;
              res.json({ret:1, msg:'Your school list has been chagned.'});
            })
          }
        })
        .catch(err => console.log(err));
    })    
    .catch(err => console.log(err));     
}); 

module.exports = router;