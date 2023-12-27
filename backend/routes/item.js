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
    tools.log('item.js','/insert', JSON.stringify(req.body));

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

    tools.log('item.js','/insert', 'data', data);

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
});

router.post('/update', (req, res) => {
    tools.log('item.js','/update', JSON.stringify(req.body));

    //CSRF check
    csrf = checkCSRF(req.body.csrf, req.user.csrf);
    if( csrf.ret == 0) {
      res.json(csrf);
      return;
    }

    // add some information more into the data object
    let data = [];

    // UPDATE Item 
    data.push(req.body.title);
    data.push(req.body.status); // status 0:before selling, 1:during trade, 2:sold
    data.push(req.body.price);
    data.push(req.body.location);
    data.push(req.body.description);
    data.push(req.body.image_names.join(','));
    data.push(Date.now());
    data.push(req.body.buyer_username);
    data.push(req.body.rid);

    tools.log('item.js','/update', 'data', data);

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
});

router.post('/insertImage', upload.single('image'), function(req, res) {
    tools.log('item.js','/insertImage1', JSON.stringify(req.body));
    tools.log('file', req.file);

    // CSRF check
        // csrf = checkCSRF(req.body.csrf, req.user.csrf);
        // if( csrf.ret == 0) {
        //     fs.unlink(global.UPLOAD_FOLDER + req.file.filename, (err) => {
        //         if (err) {
        //             throw err;
        //         }
        //         tools.log("Delete File successfully.");
        //         res.json({ret:0, msg:'File upload failed because of CSRF!'});
        //         return;
        //     });        
        // }

    res.json({ret:1, filename:req.file.filename})
});

router.post('/deleteImage', (req, res) => {
    tools.log('item.js','/deleteImage', JSON.stringify(req.body));
    tools.log('file', req.file);

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
    tools.log('item.js','/list', JSON.stringify(req.body));


    let param = [];

    param.push(req.user == undefined ? null : req.user.myschool);
    param.push(req.body.startFrom);
    param.push(req.body.limitCnt);
    tools.log('item.js','/list', 'param', param);

    db.conn().then((conn) => {
        conn.all(QUERY.Item_select, param, (err, rows) => {
            if (err) {
                throw new Error(err.message);
            }

            rows.forEach((row) => {
                row.image_names = row.image_names.split(',');
            });

            tools.log('rows2', rows)
            res.json({ret:1, items:rows});
        });
    }).catch((e) => {
        console.error(e.message); // "oh, no!"
    })
});


router.post('/detail', (req, res) => {
    tools.log('item.js','/detail', JSON.stringify(req.body));

    db.conn().then((conn) => {
        conn.get(QUERY.Item_select_one, [req.body.rid], (err, row) => {
            if (err) {
                throw new Error(err.message);
            }
            row.image_names = row.image_names.split(',');

            tools.log('item.js','/detail','result', row)
            res.json({ret:1, detail:row});
        });
    }).catch((e) => {
        console.error(e.message); // "oh, no!"
    })
});

router.post('/insertComment', (req, res) => {
    tools.log('item.js','/insertComment', JSON.stringify(req.body));

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
    // INSERT INTO ItemComment (item_rid, comment, status, date, username) values (?,?,?,?,?);
    let data = [];

    data.push(req.body.item_rid);
    data.push(req.body.comment);
    data.push(req.body.status);
    data.push(Date.now());
    data.push(req.user.username);
    tools.log('item.js','/insertComment', 'data', data);

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
});

router.post('/deleteComment', (req, res) => {
    tools.log('item.js','/deleteComment', JSON.stringify(req.body));

    // CSRF check
    csrf = checkCSRF(req.body.csrf, req.user.csrf);
    if( csrf.ret == 0) {
      res.json(csrf);
      return;
    }

    let data = [req.body.rid];
    tools.log('item.js','/deleteComment', 'data', data);

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
});

router.post('/commentList', (req, res) => {
    tools.log('item.js','/commentList', JSON.stringify(req.body));

    let data = [req.body.rid];
    tools.log('item.js','/commentList', 'data', data);

    db.conn().then((conn) => {
        conn.all(QUERY.ItemComment_select, data, (err, rows) => {
            if (err) {
                throw new Error(err.message);
            }

            tools.log('item.js','/commentList', 'result', rows);
            res.json({ret:1, commentList:rows});
        });
    }).catch((e) => {
        console.error(e.message); // "oh, no!"
    })
});

router.post('/delete', (req, res) => {
    tools.log('item.js','/delete', JSON.stringify(req.body));

    // CSRF check
    csrf = checkCSRF(req.body.csrf, req.user.csrf);
    if( csrf.ret == 0) {
      res.json(csrf);
      return;
    }


    let data = [req.body.rid];
    tools.log('item.js','/delete', 'param', data);

    db.conn().then((conn) => {
        conn.get(QUERY.Item_select_one, data, (err, row) => {
            if (err) {
                throw new Error(err.message);
            }
            tools.log('rows', row)

            for(imageName of row.image_names.split(',')) {
                fs.unlink(global.UPLOAD_FOLDER + '/' + imageName, (err) => {
                    // if (err) {
                    //     throw err;
                    // }
                });
            }
            conn.run(QUERY.Item_delete, row.rid, (err) => {
                if (err) {
                  console.error(err.message);
                }
                res.json({ret:1,msg:'delete succ'});
            });
        });
                
    }).catch((e) => {
    console.error(e.message); // "oh, no!"
    })
});

router.post('/addFavorite', (req, res) => {
    tools.log('item.js','/addFavorite', 'req.body', JSON.stringify(req.body));
    tools.log('item.js','/addFavorite', 'req.user', JSON.stringify(req.user));

    // CSRF check
    csrf = checkCSRF(req.body.csrf, req.user.csrf);
    if( csrf.ret == 0) {
      res.json(csrf);
      return;
    }

    let param = 
    {   'username': req.user.username,
        'rid': req.body.rid,
        'date': Date.now()    
    }
    addRemoveFavorite('inc', param, res)
});

router.post('/deleteFavorite', (req, res) => {
    tools.log('item.js','/deleteFavorite', JSON.stringify(req.body));
    tools.log('item.js','/deleteFavorite', JSON.stringify(req.user));

    // CSRF check
    csrf = checkCSRF(req.body.csrf, req.user.csrf);
    if( csrf.ret == 0) {
      res.json(csrf);
      return;
    }

    let param = 
    {   'username': req.user.username,
        'rid': req.body.rid,
        'date': Date.now()    
    }
    addRemoveFavorite('dec', param, res)
});

router.post('/selectFavorite', (req, res) => {
    tools.log('item.js','/selectFavorite', JSON.stringify(req.body));

// add some information more into the data object
    // INSERT INTO ItemComment (item_rid, comment, status, date, username) values (?,?,?,?,?);
    let param = [];
    param.push(req.user.username);

    tools.log('item.js','/selectFavorite', 'param', param);

    db.conn().then((conn) => {
        conn.all(QUERY.Favorite_select_item_list, param, (err, rows) => {
            if (err) {
                throw new Error(err.message);
            }

            rows.forEach((row) => {
                row.image_names = row.image_names.split(',');
            });

            tools.log('item.js','/selectFavorite', 'rows', rows);

            res.json({ret:1, items:rows});
        });
    }).catch((e) => {
        console.error(e.message); // "oh, no!"
    }) 
});

router.post('/selectFavoriteYn', (req, res) => {
    tools.log('item.js','/selectFavoriteYn', JSON.stringify(req.body));

    db.conn().then((conn) => {
        conn.get(QUERY.Favorite_select, [req.user.username, req.body.rid], (err, row) => {
            if (err) {
                throw new Error(err.message);
            }
            tools.log('item.js','/selectFavoriteYn','rows', row)

            if (row == null) {
                res.json({ret:0});
            } else {
                res.json({ret:1});
            }
        });
    }).catch((e) => {
        console.error(e.message); // "oh, no!"
    })
});

// addRemoveFavorite: Add or remove from the favorite
//   input: 'inc' or 'dec', {username, rid, date}
//   return: {ret: 0 or 1, msg: message}
// 1. Check if it's already a favorite item or not
// 2. Inc or dec the count from the Item
// 3. Insert the id of the Item into the Favorite
function addRemoveFavorite(type, argv, res) {
    // add some information more into the data object
    // INSERT INTO ItemComment (item_rid, comment, status, date, username) values (?,?,?,?,?);

    console.log('argv', argv);
    tools.log('item.js','/addRemoveFavorite', 'argv', argv);

    let param = [];
    param.push(argv.username);
    param.push(argv.rid);

    db.conn().then((conn) => {
        conn.get(QUERY.Favorite_select, param, (err, row) => {
            if (err) {
                throw new Error(err.message);
            }
            tools.log('item.js','/addRemoveFavorite','rows', row)

            if((type=='inc' && row == undefined) || (type='dec' && row != undefined)) {
                param = [];
                param.push(argv.rid);
                            
                tools.log('item.js','/addRemoveFavorite', 'param', param);
            
                db.conn().then((conn) => {
                    let query = type == 'inc' ? QUERY.Item_inc_favorite : QUERY.Item_dec_favorite;
                    conn.run(query, param, (err) => {
                        if (err) {
                          console.error(err.message);
                        }
                        tools.log('item.js','/addRemoveFavorite', 'favorite update succ');

                        param = [];
                        param.push(argv.username);
                        param.push(argv.rid);
                        if(type== 'inc') param.push(argv.date);
                                    
                        tools.log('item.js','/addRemoveFavorite', 'param', param);
                    
                        db.conn().then((conn) => {
                            let query = type == 'inc' ? QUERY.Favorite_insert : QUERY.Favorite_delete;
                            conn.run(query, param, (err) => {
                                if (err) {
                                  console.error(err.message);
                                }
                                tools.log('item.js','/addRemoveFavorite', 'favorite inc or dec succ');
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

module.exports = router;