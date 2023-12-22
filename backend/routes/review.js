const express = require('express');
const router = express.Router();
const { checkCSRF } = require('../lib/tools');
const tools = require('../lib/tools')
var mongodb = require("mongodb");
const db = require("../dblib/dbconn");
const QUERY = require('../dblib/dbquery.js');
  
router.post('/insertUserReview', (req, res) => {
    tools.log('review.js','/insertUserReview', 'body', JSON.stringify(req.body));
    tools.log('review.js','/insertUserReview', 'user', JSON.stringify(req.user));

    // CSRF check
    csrf = checkCSRF(req.body.csrf, req.user.csrf);
    if( csrf.ret == 0) {
      res.json(csrf);
      return;
    }

    let param = [];
    
    // add some information more into the data object
    // delete data['csrf'];
    // data.date = Date.now();
    // data.buyer_username = req.user.username;
    // data.score = parseInt(data.score);

    param.push(req.body.item_rid)
    param.push(req.user.username)

    // INSERT INTO UserReview (username, score, comment, date, buyer_username) values (?,?,?,?,?);
    db.conn().then((conn) => {
        tools.log('review.js','/insertUserReview', 'param1', param);
        conn.get(QUERY.Item_select_one_which_I_bought, param, (err, row) => {
            if (err) {
                throw new Error(err.message);
            }
            tools.log('rows', row)

            if( row != undefined ) {
                res.json({ret:0,msg:`You've already left a comment. One comment per trading!`});
            }
            else {
                param = []
                param.push(req.body.username)
                param.push(parseInt(req.body.score))
                param.push(req.body.comment)
                param.push(Date.now())
                param.push(req.user.username)

                tools.log('review.js','/insertUserReview', 'param2', param);
                conn.run(QUERY.UserReview_insert, param, (err, row) => {
                    if (err) {
                        throw new Error(err.message);
                    }
        
                    res.json({ret:1,msg:'insertUserReview succ'});
                });
            }
            
        });
                
    }).catch((e) => {
    console.error(e.message); // "oh, no!"
    })
});

router.post('/deleteUserReview', (req, res) => {
    tools.log('review.js','/deleteUserReview', JSON.stringify(req.body));

    // CSRF check
    csrf = checkCSRF(req.body.csrf, req.user.csrf);
    if( csrf.ret == 0) {
      res.json(csrf);
      return;
    }

    let param = [];

    param.push(req.body.rid);
    tools.log('review.js','/deleteUserReview', 'data', param);

    db.conn().then((conn) => {
        conn.run(QUERY.UserReview_delete, data, (err) => {
            if (err) {
              console.error(err.message);
            }
            res.json({ret:1,msg:'deleteUserReview succ'});
        });
    }).catch((e) => {
        console.error(e.message); // "oh, no!"
    })
});

router.post('/reviewList', (req, res) => {
    tools.log('review.js','/reviewList', JSON.stringify(req.body));

    let param = [];
    param.push(req.body.username);
    tools.log('review.js','/reviewList', 'param', param);

    db.conn().then((conn) => {
        conn.all(QUERY.UserReview_select, param, (err, rows) => {
            if (err) {
                throw new Error(err.message);
            }
            tools.log('rows', rows)

            res.json({ret:1, reviewList:rows});
        });
                
    }).catch((e) => {
    console.error(e.message); // "oh, no!"
    })
});

router.post('/tradeItemList', (req, res) => {
    tools.log('review.js','/tradeItemList', JSON.stringify(req.body));


    let param = [];
    param.push(req.body.seller_username);
    param.push(req.user.username);
    tools.log('review.js','/tradeItemList', 'param', param);

    db.conn().then((conn) => {
        conn.all(QUERY.Item_select_one_which_I_bought, param, (err, rows) => {
            if (err) {
                throw new Error(err.message);
            }
            tools.log('rows', rows)

            res.json({ret:1, tradeItemList:rows});
        });
                
    }).catch((e) => {
    console.error(e.message); // "oh, no!"
    })
});

module.exports = router;