const express = require('express');
const router = express.Router();
const { checkCSRF } = require('../lib/tools');
const tools = require('../lib/tools')
var mongodb = require("mongodb");
const fs = require('fs');
const db = require("../dblib/dbconn");
const QUERY = require('../dblib/dbquery.js');
  

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
    // let data = req.body;

    // , data.favorite, data.buyer_username
    let data = [];

    data.push(req.body.title);
    data.push(0); // status 0:before selling, 1:during trade, 2:sold
    data.push(req.body.price);
    data.push(req.body.myschool);
    data.push(req.body.location);
    data.push(req.body.description);
    data.push(req.body.image_names.join(','));
    data.push(req.user.username);
    data.push(Date.now());
    data.push(0); // favorite
    data.push(''); // buyer_username

    console.log('item.js','/insert', 'data', data);

    db.conn().then((conn) => {
        conn.run(QUERY.Item_insert, data, (err) => {
            if (err) {
              console.error(err.message);
            }
            res.json({ret:1,msg:'sign succ'});
        });
    }).catch((e) => {
    console.error(e.message); // "oh, no!"
    })  

    // tools.getDb('item').then(coll => {
    //     coll.insertOne(data).then(result => {
    //         console.log('insertOne', result);
    //         let retObj = {ret:1};
    //         res.json(retObj);
    //     })
    //     .catch(err => console.log(err));
    // })    
    // .catch(err => console.log(err));    
});

router.post('/update', (req, res) => {
    console.log('item.js','/update', JSON.stringify(req.body));

    //CSRF check
    csrf = checkCSRF(req.body.csrf, req.user.csrf);
    if( csrf.ret == 0) {
      res.json(csrf);
      return;
    }

    // add some information more into the data object
    let data = [];

    // UPDATE Item SET title = ?, status = ?, price = ?, location = ?, description = ?, image_names = ?, date = ?, buyer_username = ? WHERE _id = ?;
    data.push(req.body.title);
    data.push(req.body.status); // status 0:before selling, 1:during trade, 2:sold
    data.push(req.body.price);
    data.push(req.body.location);
    data.push(req.body.description);
    data.push(req.body.image_names.join(','));
    data.push(Date.now());
    data.push(req.body.buyer_username);
    data.push(req.body.id);

    console.log('item.js','/update', 'data', data);

    db.conn().then((conn) => {
        conn.run(QUERY.Item_update, data, (err) => {
            if (err) {
              console.error(err.message);
            }
            res.json({ret:1,msg:'sign succ'});
        });
    }).catch((e) => {
    console.error(e.message); // "oh, no!"
    })  

    // tools.getDb('item').then(coll => {
    //     coll.updateOne({_id: new mongodb.ObjectID(req.body.id)},{$set:data})
    //     .then(result => {
    //       console.log('updateOne', result);
    //       res.json({ret:1,msg:'update succ'});
    //     })
    //     .catch(err => console.log(err));
    // })    
    // .catch(err => console.log(err));    
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

    req.body.image_names = req.body.image_names.split(',');

    for(imageName of req.body.image_names) {
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


    let param = [];

    param.push(req.user == undefined ? null : req.user.myschool);
    param.push(req.body.startFrom);
    param.push(req.body.limitCnt);
    console.log('item.js','/list', 'param', param);

    db.conn().then((conn) => {
        conn.all(QUERY.Item_select, param, (err, rows) => {
            if (err) {
                throw new Error(err.message);
            }

            rows.forEach((row) => {
                row.image_names = row.image_names.split(',');
            });

            console.log('rows2', rows)
            res.json({ret:1, items:rows});
        });
    }).catch((e) => {
        console.error(e.message); // "oh, no!"
    })


    // tools.getDb('item').then(coll => {
    //     let startFrom = req.body.startFrom;
    //     let limitCnt = req.body.limitCnt;
    //     let condition = {}

    //     if (req.user !== undefined) {
    //         condition.myschool = req.user.myschool
    //     }

    //     if (req.body.username !== undefined) {
    //         condition.username = req.body.username
    //     }
    //     coll.find(condition).skip(startFrom).limit(limitCnt).sort({"date":-1,"username":1}).toArray().then(data => {
    //         console.log(`items:data`, data)
    //         res.json({ret:1, items:data});
    //     }).catch(err => console.log(err));
    // }).catch(err => console.log(err));
});


router.post('/detail', (req, res) => {
    console.log('item.js','/detail', JSON.stringify(req.body));

    db.conn().then((conn) => {
        conn.get(QUERY.Item_select_one, [req.body.id], (err, row) => {
            if (err) {
                throw new Error(err.message);
            }

            row.image_names = row.image_names.split(',');

            console.log('item.js','/detail','result', row)
            res.json({ret:1, detail:row});
        });
    }).catch((e) => {
        console.error(e.message); // "oh, no!"
    })

    // tools.getDb('item').then(coll => {
    //     coll.findOne({_id: new mongodb.ObjectID(req.body.id)}).then(data => {
    //         console.log('item.js','/detail', JSON.stringify(data));
    //         res.json({ret:1, detail:data});
    //     }).catch(err => console.log(err));
    // }).catch(err => console.log(err));
});

router.post('/insertComment', (req, res) => {
    console.log('item.js','/insertComment', JSON.stringify(req.body));

    // CSRF check
    csrf = checkCSRF(req.body.csrf, req.user.csrf);
    if( csrf.ret == 0) {
      res.json(csrf);
      return;
    }
    
    // if the item has been sold, insert comment not allowed
    if (req.body.status === '2') {
        res.json({ret:0, msg:'The sold item cannot have more comments!'});
        return;
    }

    // add some information more into the data object
    // INSERT INTO ItemComment (item_id, comment, status, date, username) values (?,?,?,?,?);
    let data = [];

    data.push(req.body.item_id);
    data.push(req.body.comment);
    data.push(req.body.status);
    data.push(Date.now());
    data.push(req.user.username);
    console.log('item.js','/insertComment', 'data', data);

    db.conn().then((conn) => {
        conn.run(QUERY.ItemComment_insert, data, (err) => {
            if (err) {
              console.error(err.message);
            }
            res.json({ret:1,msg:'insertComment succ'});
        });
    }).catch((e) => {
    console.error(e.message); // "oh, no!"
    })

    // tools.getDb('item_comment').then(coll => {
    //     coll.insertOne(data).then(result => {
    //         console.log('insertOne', result);
    //         let retObj = {ret:1};
    //         res.json(retObj);
    //     })
    //     .catch(err => console.log(err));
    // })    
    // .catch(err => console.log(err));    
});

router.post('/deleteComment', (req, res) => {
    console.log('item.js','/deleteComment', JSON.stringify(req.body));

    // CSRF check
    csrf = checkCSRF(req.body.csrf, req.user.csrf);
    if( csrf.ret == 0) {
      res.json(csrf);
      return;
    }

    let data = [req.body._id];
    console.log('item.js','/deleteComment', 'data', data);

    db.conn().then((conn) => {
        conn.run(QUERY.ItemComment_delete, data, (err) => {
            if (err) {
              console.error(err.message);
            }
            res.json({ret:1,msg:'deleteComment succ'});
        });
    }).catch((e) => {
    console.error(e.message); // "oh, no!"
    })

    // tools.getDb('item_comment').then(coll => {
    //     coll.deleteOne( {_id : new mongodb.ObjectID(req.body._id) } ).then(data => {
    //         res.json({ret:1});
    //     }).catch(err => console.log(err));
    // }).catch(err => console.log(err));

});

router.post('/commentList', (req, res) => {
    console.log('item.js','/commentList', JSON.stringify(req.body));

    let data = [req.body.id];
    console.log('item.js','/commentList', 'data', data);

    db.conn().then((conn) => {
        conn.all(QUERY.ItemComment_select, data, (err, rows) => {
            if (err) {
                throw new Error(err.message);
            }

            console.log('item.js','/commentList', 'result', rows);
            res.json({ret:1, commentList:rows});
        });
    }).catch((e) => {
        console.error(e.message); // "oh, no!"
    })

    // tools.getDb('item_comment').then(coll => {
    //     coll.find({item_id: req.body.id}).sort({"date":-1,"username":1}).toArray().then(data => {
    //         res.json({ret:1, commentList:data});
    //     }).catch(err => console.log(err));
    // }).catch(err => console.log(err));
});

router.post('/delete', (req, res) => {
    console.log('item.js','/delete', JSON.stringify(req.body));

    // CSRF check
    csrf = checkCSRF(req.body.csrf, req.user.csrf);
    if( csrf.ret == 0) {
      res.json(csrf);
      return;
    }


    let data = [req.body._id];
    console.log('item.js','/delete', 'param', data);

    db.conn().then((conn) => {
        conn.get(QUERY.Item_select_one, data, (err, row) => {
            if (err) {
                throw new Error(err.message);
            }
            console.log('rows', row)

            for(imageName of row.image_names.split(',')) {
                fs.unlink(global.UPLOAD_FOLDER + '/' + imageName, (err) => {
                    // if (err) {
                    //     throw err;
                    // }
                });
            }
            conn.run(QUERY.Item_delete, row._id, (err) => {
                if (err) {
                  console.error(err.message);
                }
                res.json({ret:1,msg:'delete succ'});
            });
        });
                
    }).catch((e) => {
    console.error(e.message); // "oh, no!"
    })

    // tools.getDb('item').then(coll => {
    //     coll.findOne({_id: new mongodb.ObjectID(req.body._id)}).then(data => {
    //         console.log('data', data);
    //         for(imageName of data.image_names) {
    //             fs.unlink(global.UPLOAD_FOLDER + imageName, (err) => {
    //                 // if (err) {
    //                 //     throw err;
    //                 // }
    //             });
    //         }

    //         console.log("Delete File successfully.");

    //         tools.getDb('item').then(coll => {
    //             coll.deleteOne( {_id : new mongodb.ObjectID(req.body._id) } ).then(data => {
    //                 res.json({ret:1});
    //             }).catch(err => console.log(err));
    //         }).catch(err => console.log(err));
    //     }).catch(err => console.log(err));
    // }).catch(err => console.log(err));

});


// Add or remove from the favorite
//   input: 'inc' or 'dec', {username, _id, date}
//   return: {ret: 0 or 1, msg: message}
// 1. Check if it's already a favorite item or not
// 2. Inc or dec the count from the Item
// 3. Insert the id of the Item into the Favorite

function addRemoveFavorite(type, argv, res) {
    // add some information more into the data object
    // INSERT INTO ItemComment (item_id, comment, status, date, username) values (?,?,?,?,?);

    console.log('item.js','/addRemoveFavorite', 'argv', argv);

    let param = [];
    param.push(argv.username);
    param.push(argv.id);

    db.conn().then((conn) => {
        conn.get(QUERY.Favorite_select, param, (err, row) => {
            if (err) {
                throw new Error(err.message);
            }
            console.log('item.js','/addRemoveFavorite','rows', row)

            if((type=='inc' && row == undefined) || (type='dec' && row != undefined)) {
                param = [];
                param.push(argv.id);
                            
                console.log('item.js','/addRemoveFavorite', 'param', param);
            
                db.conn().then((conn) => {
                    let query = type == 'inc' ? QUERY.Item_inc_favorite : QUERY.Item_dec_favorite;
                    conn.run(query, param, (err) => {
                        if (err) {
                          console.error(err.message);
                        }
                        console.log('item.js','/addRemoveFavorite', 'favorite update succ');

                        param = [];
                        param.push(argv.username);
                        param.push(argv.id);
                        param.push(argv.date);
                                    
                        console.log('item.js','/addRemoveFavorite', 'param', param);
                    
                        db.conn().then((conn) => {
                            let query = type == 'inc' ? QUERY.Favorite_insert : QUERY.Favorite_delete;
                            conn.run(query, param, (err) => {
                                if (err) {
                                  console.error(err.message);
                                }
                                console.log('item.js','/addRemoveFavorite', 'favorite inc or dec succ');
                                res.json(type=='inc' ? 
                                    {ret:1, msg:'Added to your favorite list!'} : 
                                    {ret:1, msg:'Removed to your favorite list!'}
                                )
                            });
                        }).catch((e) => {
                        console.error(e.message); // "oh, no!"
                        })                            
                    });
                }).catch((e) => {
                console.error(e.message); // "oh, no!"
                }) 
            }
        });
    }).catch((e) => {
        console.error(e.message); // "oh, no!"
    })
}

router.post('/addFavorite', (req, res) => {
    console.log('item.js','/addFavorite', 'req.body', JSON.stringify(req.body));
    console.log('item.js','/addFavorite', 'req.user', JSON.stringify(req.user));

    // CSRF check
    csrf = checkCSRF(req.body.csrf, req.user.csrf);
    if( csrf.ret == 0) {
      res.json(csrf);
      return;
    }

    let param = 
    {   'username': req.user.username,
        'id': req.body._id,
        'date': req.Date.now()    
    }
    addRemoveFavorite('dec', param, res)

 
    
    // check before add favorite
    // tools.getDb('favorite').then(coll => {
    //     coll.findOne({username: req.user.username, item_id: req.body._id}).then(data => {
    //         // proceed when not added to a favorite item
    //         if (data == null) {
    //             // inc favorite by 1
    //             tools.getDb('item').then((coll) => {
    //                 coll.updateOne({_id: new mongodb.ObjectID(req.body._id)},{$inc: { favorite: 1 }}).then(result => {
    //                     console.log('inc Favorite', result);

    //                     // add favorite 
    //                     tools.getDb('favorite').then((coll) => {
    //                         let data = {username: req.user.username, item_id:req.body._id, date:Date.now()}
    //                         coll.insertOne(data).then(result => {
    //                             console.log('add Favorite', result);
    //                             let retObj = {ret:1, msg:'Added to your favorite list!'};
    //                             res.json(retObj);
    //                         }).catch(err => console.log(err));
    //                     }).catch(err => console.log(err));   

    //                 }).catch(err => console.log(err));
    //             }).catch(err => console.log(err));   
    //         }
    //         else {
    //             res.json({ret:0,msg:'Already checked for the favorite item.'});
    //         }
    //     }).catch(err => console.log(err));
    // }).catch(err => console.log(err));
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

    let param = 
    {   'username': req.user.username,
        'id': req.body._id,
        'date': Date.now()    
    }
    addRemoveFavorite('dec', param, res)
     

  
    // check before add favorite
    // tools.getDb('favorite').then(coll => {
    //     coll.findOne({username: req.user.username, item_id: req.body._id}).then(data => {
    //         // proceed when not added to a favorite item
    //         if (data != null) {
    //             // inc favorite by 1
    //             tools.getDb('item').then((coll) => {
    //                 coll.updateOne({_id: new mongodb.ObjectID(req.body._id)},{$inc: { favorite: -1 }}).then(result => {
    //                     console.log('dec Favorite', result);

    //                     tools.getDb('favorite').then((coll) => {
    //                         let data = {username: req.user.username, item_id:req.body._id}
    //                         coll.deleteOne(data).then(result => {
    //                             let retObj = {ret:1, msg:'Deleted from your favorite list!'};
    //                             res.json(retObj);
    //                         }).catch(err => console.log(err));
    //                     }).catch(err => console.log(err));                        

    //                 }).catch(err => console.log(err));
    //             }).catch(err => console.log(err));   
    //         }
    //         else {
    //             res.json({ret:0,msg:'You can delete if it is on your favorite list.'});
    //         }
    //     }).catch(err => console.log(err));
    // }).catch(err => console.log(err));    
});

router.post('/selectFavorite', (req, res) => {
    console.log('item.js','/selectFavorite', JSON.stringify(req.body));

// add some information more into the data object
    // INSERT INTO ItemComment (item_id, comment, status, date, username) values (?,?,?,?,?);
    let param = [];
    param.push(req.user.username);

    console.log('item.js','/selectFavorite', 'param', param);

    db.conn().then((conn) => {
        conn.all(QUERY.Favorite_select_item_list, param, (err, rows) => {
            if (err) {
                throw new Error(err.message);
            }

            rows.forEach((row) => {
                row.image_names = row.image_names.split(',');
            });

            console.log('item.js','/selectFavorite', 'rows', rows);

            res.json({ret:1, items:rows});
        });
    }).catch((e) => {
        console.error(e.message); // "oh, no!"
    }) 

    // tools.getDb('favorite').then(coll => {
    //     // coll.find({username: req.body.username}).sort({"date":-1}).toArray().then(data => {
    //     //     res.json({ret:1, items:data});
    //     // }).catch(err => console.log(err));
    //     coll.aggregate([
    //         { $match: { username: req.body.username }},
    //         { $addFields: { convertedId: { $toObjectId: "$item_id" }}},
    //         { 
    //           $lookup:
    //             {
    //                 from: 'item',
    //                 localField: 'convertedId',
    //                 foreignField: '_id',
    //                 as: 'itemInfo'
    //             }
    //         }
    //     ]).toArray().then(data => {
    //         console.log('selectFavorite', JSON.stringify(data));
    //         res.json({ret:1, items:data});
    //     });
          

    // }).catch(err => console.log(err));
});

router.post('/selectFavoriteYn', (req, res) => {
    console.log('item.js','/selectFavoriteYn', JSON.stringify(req.body));

    db.conn().then((conn) => {
        conn.get(QUERY.Favorite_select, [req.user.username, req.body.id], (err, row) => {
            if (err) {
                throw new Error(err.message);
            }
            console.log('item.js','/selectFavoriteYn','rows', row)

            if (row == null) {
                res.json({ret:0});
            } else {
                res.json({ret:1});
            }
        });
    }).catch((e) => {
        console.error(e.message); // "oh, no!"
    })

    // tools.getDb('favorite').then(coll => {
    //     coll.findOne({username: req.user.username, item_id: req.body.id}).then(data => {
    //         console.log('selectFavoriteYn:', data)
    //         if (data == null) {
    //             res.json({ret:0});
    //         } else {
    //             res.json({ret:1});
    //         }
    //     }).catch(err => console.log(err));
    // }).catch(err => console.log(err));
});

module.exports = router;