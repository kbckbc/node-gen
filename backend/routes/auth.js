const express = require('express');
const { checkCSRF } = require('../lib/tools');
const router = express.Router();
const tools = require('../lib/tools')

module.exports = function (passport) {
  router.post('/loginCheck', function(req, res, next) {
    console.log(`loginCheck, req.user:`, JSON.stringify(req.user));
    if(req.user) {
      res.send({ret:1, user:req.user});
    }
    else {
      res.send({ret:0});
    }
  });

  router.post('/login', passport.authenticate('local', {
    successRedirect: '/auth/loginSucc',
    failureRedirect: '/auth/loginFail',
    failureFlash:true
  }));

  router.get('/loginSucc', function(req, res, next) {
      console.log('/loginSucc', JSON.stringify(req.user))
      res.json({ret:1, user: req.user});
  });
  

  router.get('/loginFail', function(req, res, next) {
    res.json({ret:0,msg:req.flash().error});
  });
    
  router.post('/logout', function(req, res, next) {
    // console.log('auth', '/logout 1', req.user, 'req.session', req.session);
    if (req.session) {
      req.session.destroy();
    }
    res.json({ret:1});
  });  

  return router;
};