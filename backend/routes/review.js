const express = require('express');
const router = express.Router();
const { checkCSRF } = require('../lib/tools');
const tools = require('../lib/tools')
var mongodb = require("mongodb");
const db = require("../dblib/dbconn");
const QUERY = require('../dblib/dbquery.js');
  
router.post('/insertUserReview', (req, res) => {
    console.log('review.js','/insertUserReview', 'body', JSON.stringify(req.body));
    console.log('review.js','/insertUserReview', 'user', JSON.stringify(req.user));

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

    param.push(req.body.item_id)
    param.push(req.user.username)

    // INSERT INTO UserReview (username, score, comment, date, buyer_username) values (?,?,?,?,?);
    db.conn().then((conn) => {
        console.log('review.js','/insertUserReview', 'param1', param);
        conn.get(QUERY.Item_select_one_which_I_bought, param, (err, row) => {
            if (err) {
                throw new Error(err.message);
            }
            console.log('rows', row)

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

                console.log('review.js','/insertUserReview', 'param2', param);
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


    // tools.getDb('user_review').then(coll => {
    //     coll.findOne({item_id: req.body.item_id, buyer_username:req.user.username}).then(result => {
    //         console.log('asdfasdfasfasasdf', result);
    //         if( result != null ) {
    //           res.json({ret:0,msg:`You've already left a comment. One comment per trading!`});
    //         }
    //         else {
    //             coll.insertOne(data).then(result => {
    //                 console.log('insertOne', result);
    //                 let retObj = {ret:1};
    //                 res.json(retObj);
    //             })
    //             .catch(err => console.log(err));
    //         }
    //       })
    //       .catch(err => console.log(err));
    // })    
    // .catch(err => console.log(err));    
});

router.post('/deleteUserReview', (req, res) => {
    console.log('review.js','/deleteUserReview', JSON.stringify(req.body));

    // CSRF check
    csrf = checkCSRF(req.body.csrf, req.user.csrf);
    if( csrf.ret == 0) {
      res.json(csrf);
      return;
    }

    let param = [];

    param.push(req.body._id);
    console.log('review.js','/deleteUserReview', 'data', param);

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

    // tools.getDb('user_review').then(coll => {
    //     coll.deleteOne( {_id : new mongodb.ObjectID(req.body._id) } ).then(data => {
    //         res.json({ret:1});
    //     }).catch(err => console.log(err));
    // }).catch(err => console.log(err));
});

router.post('/reviewList', (req, res) => {
    console.log('review.js','/reviewList', JSON.stringify(req.body));

    let param = [];
    param.push(req.body.username);
    console.log('review.js','/reviewList', 'param', param);

    db.conn().then((conn) => {
        conn.all(QUERY.UserReview_select, param, (err, rows) => {
            if (err) {
                throw new Error(err.message);
            }
            console.log('rows', rows)

            res.json({ret:1, reviewList:rows});
        });
                
    }).catch((e) => {
    console.error(e.message); // "oh, no!"
    })

    // tools.getDb('user_review').then(coll => {
    //     coll.find({username: req.body.username}).sort({"date":-1,"username":1}).toArray().then(data => {
    //         res.json({ret:1, reviewList:data});
    //     }).catch(err => console.log(err));
    // }).catch(err => console.log(err));
});

router.post('/tradeItemList', (req, res) => {
    console.log('review.js','/tradeItemList', JSON.stringify(req.body));


    let param = [];
    param.push(req.body.seller_username);
    param.push(req.user.username);
    console.log('review.js','/tradeItemList', 'param', param);

    db.conn().then((conn) => {
        conn.all(QUERY.Item_select_one_which_I_bought, param, (err, rows) => {
            if (err) {
                throw new Error(err.message);
            }
            console.log('rows', rows)

            res.json({ret:1, tradeItemList:rows});
        });
                
    }).catch((e) => {
    console.error(e.message); // "oh, no!"
    })
    
    
    // tools.getDb('item').then(coll => {
    //     coll.find({username: req.body.seller_username, buyer_username: req.user.username}).sort({"date":-1,"username":1}).toArray().then(data => {
    //         console.log('review.js','/tradeItemList', JSON.stringify(data));
    //         res.json({ret:1, tradeItemList:data});
    //     }).catch(err => console.log(err));
    // }).catch(err => console.log(err));
});

module.exports = router;