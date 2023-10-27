const express = require('express');
const router = express.Router();
const { checkCSRF } = require('../lib/tools');
const tools = require('../lib/tools')
var mongodb = require("mongodb");

router.post('/insertUserReview', (req, res) => {
    console.log('review.js','/insertUserReview', JSON.stringify(req.body));
    console.log('review.js','/insertUserReview', JSON.stringify(req.user));

    // CSRF check
    csrf = checkCSRF(req.body.csrf, req.user.csrf);
    if( csrf.ret == 0) {
      res.json(csrf);
      return;
    }

    let data = req.body;
    
    // add some information more into the data object
    delete data['csrf'];
    data.date = Date.now();
    data.buyer_username = req.user.username;
    data.score = parseInt(data.score);

    tools.getDb('user_review').then(coll => {
        coll.findOne({item_id: req.body.item_id, buyer_username:req.user.username}).then(result => {
            console.log('asdfasdfasfasasdf', result);
            if( result != null ) {
              res.json({ret:0,msg:`You've already left a comment. One comment per trading!`});
            }
            else {
                coll.insertOne(data).then(result => {
                    console.log('insertOne', result);
                    let retObj = {ret:1};
                    res.json(retObj);
                })
                .catch(err => console.log(err));
            }
          })
          .catch(err => console.log(err));
    })    
    .catch(err => console.log(err));    
});

router.post('/deleteUserReview', (req, res) => {
    console.log('review.js','/deleteUserReview', JSON.stringify(req.body));

    // CSRF check
    csrf = checkCSRF(req.body.csrf, req.user.csrf);
    if( csrf.ret == 0) {
      res.json(csrf);
      return;
    }

    tools.getDb('user_review').then(coll => {
        coll.deleteOne( {_id : new mongodb.ObjectID(req.body._id) } ).then(data => {
            res.json({ret:1});
        }).catch(err => console.log(err));
    }).catch(err => console.log(err));

});

router.post('/reviewList', (req, res) => {
    console.log('review.js','/reviewList', JSON.stringify(req.body));
    tools.getDb('user_review').then(coll => {
        coll.find({username: req.body.username}).sort({"date":-1,"username":1}).toArray().then(data => {
            res.json({ret:1, reviewList:data});
        }).catch(err => console.log(err));
    }).catch(err => console.log(err));
});

router.post('/tradeItemList', (req, res) => {
    console.log('review.js','/tradeItemList', JSON.stringify(req.body));

    tools.getDb('item').then(coll => {
        coll.find({username: req.body.seller_username, buyer_username: req.user.username}).sort({"date":-1,"username":1}).toArray().then(data => {
            console.log('review.js','/tradeItemList', JSON.stringify(data));
            res.json({ret:1, tradeItemList:data});
        }).catch(err => console.log(err));
    }).catch(err => console.log(err));
});

module.exports = router;