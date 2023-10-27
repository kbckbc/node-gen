const express = require('express');
const router = express.Router();
const { checkCSRF } = require('../lib/tools');
const tools = require('../lib/tools')
var mongodb = require("mongodb");
const fs = require('fs');


// for file uploading
var mime = require('mime-types')
const multer  = require('multer');
var storage = multer.diskStorage({
  destination: global.UPLOAD_FOLDER,
  filename: function (req, file, cb) {
    cb(null, Date.now() + '.' + mime.extension(file.mimetype))
  }
})
var upload = multer({ storage: storage })

router.post('/insert', (req, res) => {
    console.log('item.js','/insert', JSON.stringify(req.body));

    // CSRF check
    csrf = checkCSRF(req.body.csrf, req.user.csrf);
    if( csrf.ret == 0) {
      res.json(csrf);
      return;
    }

    let data = req.body;

    // add some information more into the data object
    delete data['csrf'];
    data.username = req.user.username;
    data.date = Date.now();
    data.status = '0'; // 0:before selling, 1:during trade, 2:sold
    data.favorite = 0;
    data.buyer_username = '';

    tools.getDb('item').then(coll => {
        coll.insertOne(data).then(result => {
            console.log('insertOne', result);
            let retObj = {ret:1};
            res.json(retObj);
        })
        .catch(err => console.log(err));
    })    
    .catch(err => console.log(err));    
});

router.post('/update', (req, res) => {
    console.log('item.js','/update', JSON.stringify(req.body));

    //CSRF check
    csrf = checkCSRF(req.body.csrf, req.user.csrf);
    if( csrf.ret == 0) {
      res.json(csrf);
      return;
    }

    let data = {...req.body};

    // add some information more into the data object
    delete data['csrf'];
    delete data['username'];
    delete data['id'];
    delete data['mySchool'];
    data.date = Date.now()

    tools.getDb('item').then(coll => {
        coll.updateOne({_id: new mongodb.ObjectID(req.body.id)},{$set:data})
        .then(result => {
          console.log('updateOne', result);
          res.json({ret:1,msg:'update succ'});
        })
        .catch(err => console.log(err));
    })    
    .catch(err => console.log(err));    
});

router.post('/insertImage', upload.single('image'), function(req, res) {
    console.log('item.js','/insertImage1', JSON.stringify(req.body));
    console.log('file', req.file);

    // CSRF check
        // csrf = checkCSRF(req.body.csrf, req.user.csrf);
        // if( csrf.ret == 0) {
        //     fs.unlink(global.UPLOAD_FOLDER + req.file.filename, (err) => {
        //         if (err) {
        //             throw err;
        //         }
        //         console.log("Delete File successfully.");
        //         res.json({ret:0, msg:'File upload failed because of CSRF!'});
        //         return;
        //     });        
        // }

    res.json({ret:1, filename:req.file.filename})
});

router.post('/deleteImage', (req, res) => {
    console.log('item.js','/deleteImage', JSON.stringify(req.body));
    console.log('file', req.file);

    // CSRF check
    // csrf = checkCSRF(req.body.csrf, req.user.csrf);
    // if( csrf.ret == 0) {
    //   res.json(csrf);
    //   return;
    // }

    for(imageName of req.body.imageNames) {
        fs.unlink(global.UPLOAD_FOLDER + imageName, (err) => {
            if (err) {
                throw err;
            }
        });
    }

    res.json({ret:1})
});
  

router.post('/list', (req, res) => {
    console.log('item.js','/list', JSON.stringify(req.body));

    tools.getDb('item').then(coll => {
        let startFrom = req.body.startFrom;
        let limitCnt = req.body.limitCnt;
        let condition = {}

        if (req.user !== undefined) {
            condition.mySchool = req.user.mySchool
        }

        if (req.body.username !== undefined) {
            condition.username = req.body.username
        }
        coll.find(condition).skip(startFrom).limit(limitCnt).sort({"date":-1,"username":1}).toArray().then(data => {
            res.json({ret:1, items:data});
        }).catch(err => console.log(err));
    }).catch(err => console.log(err));
});


router.post('/detail', (req, res) => {
    console.log('item.js','/detail', JSON.stringify(req.body));

    tools.getDb('item').then(coll => {
        coll.findOne({_id: new mongodb.ObjectID(req.body.id)}).then(data => {
            console.log('item.js','/detail', JSON.stringify(data));
            res.json({ret:1, detail:data});
        }).catch(err => console.log(err));
    }).catch(err => console.log(err));
});

router.post('/insertComment', (req, res) => {
    console.log('item.js','/insertComment', JSON.stringify(req.body));

    // CSRF check
    csrf = checkCSRF(req.body.csrf, req.user.csrf);
    if( csrf.ret == 0) {
      res.json(csrf);
      return;
    }

    let data = req.body;
    
    // if the item has been sold, insert comment not allowed
    if (data.status === '2') {
        res.json({ret:0, msg:'The sold item cannot have more comments!'});
        return;
    }
    // add some information more into the data object
    delete data['csrf'];
    data.date = Date.now();
    data.username = req.user.username;

    tools.getDb('item_comment').then(coll => {
        coll.insertOne(data).then(result => {
            console.log('insertOne', result);
            let retObj = {ret:1};
            res.json(retObj);
        })
        .catch(err => console.log(err));
    })    
    .catch(err => console.log(err));    
});

router.post('/deleteComment', (req, res) => {
    console.log('item.js','/deleteComment', JSON.stringify(req.body));

    // CSRF check
    csrf = checkCSRF(req.body.csrf, req.user.csrf);
    if( csrf.ret == 0) {
      res.json(csrf);
      return;
    }

    tools.getDb('item_comment').then(coll => {
        coll.deleteOne( {_id : new mongodb.ObjectID(req.body._id) } ).then(data => {
            res.json({ret:1});
        }).catch(err => console.log(err));
    }).catch(err => console.log(err));

});

router.post('/commentList', (req, res) => {
    console.log('item.js','/commentList', JSON.stringify(req.body));
    tools.getDb('item_comment').then(coll => {
        coll.find({item_id: req.body.id}).sort({"date":-1,"username":1}).toArray().then(data => {
            res.json({ret:1, commentList:data});
        }).catch(err => console.log(err));
    }).catch(err => console.log(err));
});

router.post('/delete', (req, res) => {
    console.log('item.js','/delete', JSON.stringify(req.body));

    // CSRF check
    csrf = checkCSRF(req.body.csrf, req.user.csrf);
    if( csrf.ret == 0) {
      res.json(csrf);
      return;
    }

    tools.getDb('item').then(coll => {
        coll.findOne({_id: new mongodb.ObjectID(req.body._id)}).then(data => {
            console.log('data', data);
            for(imageName of data.imageNames) {
                fs.unlink(global.UPLOAD_FOLDER + imageName, (err) => {
                    // if (err) {
                    //     throw err;
                    // }
                });
            }

            console.log("Delete File successfully.");

            tools.getDb('item').then(coll => {
                coll.deleteOne( {_id : new mongodb.ObjectID(req.body._id) } ).then(data => {
                    res.json({ret:1});
                }).catch(err => console.log(err));
            }).catch(err => console.log(err));
        }).catch(err => console.log(err));
    }).catch(err => console.log(err));


});


router.post('/addFavorite', (req, res) => {
    console.log('item.js','/addFavorite', JSON.stringify(req.body));
    console.log('item.js','/addFavorite', JSON.stringify(req.user));

    // CSRF check
    csrf = checkCSRF(req.body.csrf, req.user.csrf);
    if( csrf.ret == 0) {
      res.json(csrf);
      return;
    }

    // check before add favorite
    tools.getDb('favorite').then(coll => {
        coll.findOne({username: req.user.username, item_id: req.body._id}).then(data => {
            // proceed when not added to a favorite item
            if (data == null) {
                // inc favorite by 1
                tools.getDb('item').then((coll) => {
                    coll.updateOne({_id: new mongodb.ObjectID(req.body._id)},{$inc: { favorite: 1 }}).then(result => {
                        console.log('inc Favorite', result);

                        // add favorite 
                        tools.getDb('favorite').then((coll) => {
                            let data = {username: req.user.username, item_id:req.body._id, date:Date.now()}
                            coll.insertOne(data).then(result => {
                                console.log('add Favorite', result);
                                let retObj = {ret:1, msg:'Added to your favorite list!'};
                                res.json(retObj);
                            }).catch(err => console.log(err));
                        }).catch(err => console.log(err));   

                    }).catch(err => console.log(err));
                }).catch(err => console.log(err));   
            }
            else {
                res.json({ret:0,msg:'Already checked for the favorite item.'});
            }
        }).catch(err => console.log(err));
    }).catch(err => console.log(err));
});

router.post('/deleteFavorite', (req, res) => {
    console.log('item.js','/deleteFavorite', JSON.stringify(req.body));
    console.log('item.js','/deleteFavorite', JSON.stringify(req.user));

    // CSRF check
    csrf = checkCSRF(req.body.csrf, req.user.csrf);
    if( csrf.ret == 0) {
      res.json(csrf);
      return;
    }

    // check before add favorite
    tools.getDb('favorite').then(coll => {
        coll.findOne({username: req.user.username, item_id: req.body._id}).then(data => {
            // proceed when not added to a favorite item
            if (data != null) {
                // inc favorite by 1
                tools.getDb('item').then((coll) => {
                    coll.updateOne({_id: new mongodb.ObjectID(req.body._id)},{$inc: { favorite: -1 }}).then(result => {
                        console.log('dec Favorite', result);

                        tools.getDb('favorite').then((coll) => {
                            let data = {username: req.user.username, item_id:req.body._id}
                            coll.deleteOne(data).then(result => {
                                let retObj = {ret:1, msg:'Deleted from your favorite list!'};
                                res.json(retObj);
                            }).catch(err => console.log(err));
                        }).catch(err => console.log(err));                        

                    }).catch(err => console.log(err));
                }).catch(err => console.log(err));   
            }
            else {
                res.json({ret:0,msg:'You can delete if it is on your favorite list.'});
            }
        }).catch(err => console.log(err));
    }).catch(err => console.log(err));    
});

router.post('/selectFavorite', (req, res) => {
    console.log('item.js','/selectFavorite', JSON.stringify(req.body));

    tools.getDb('favorite').then(coll => {
        // coll.find({username: req.body.username}).sort({"date":-1}).toArray().then(data => {
        //     res.json({ret:1, items:data});
        // }).catch(err => console.log(err));
        coll.aggregate([
            { $match: { username: req.body.username }},
            { $addFields: { convertedId: { $toObjectId: "$item_id" }}},
            { 
              $lookup:
                {
                    from: 'item',
                    localField: 'convertedId',
                    foreignField: '_id',
                    as: 'itemInfo'
                }
            }
        ]).toArray().then(data => {
            console.log('selectFavorite', JSON.stringify(data));
            res.json({ret:1, items:data});
        });
          

    }).catch(err => console.log(err));
});

router.post('/selectFavoriteYn', (req, res) => {
    console.log('item.js','/selectFavoriteYn', JSON.stringify(req.body));
    tools.getDb('favorite').then(coll => {
        coll.findOne({username: req.user.username, item_id: req.body.id}).then(data => {
            console.log('selectFavoriteYn:', data)
            if (data == null) {
                res.json({ret:0});
            } else {
                res.json({ret:1});
            }
        }).catch(err => console.log(err));
    }).catch(err => console.log(err));
});

module.exports = router;