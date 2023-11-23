module.exports = {
  // example of implicit Promise return
  getDb1: (collName) => {
    const uri = global.DB_URI;    
    return require('mongodb').MongoClient.connect(uri)
      .then(db => db.db("nextbrainDB"))
      .then(db => db.collection(collName))
      .catch(error => console.log("error:", error))
  },
  
  // example of explicit Promise return
  getDb2: (collName) => {
    return new Promise((resolve, reject) => {
      const uri = global.DB_URI;
  
      require('mongodb').MongoClient.connect(uri, function(err, db) {
        if (err) reject(new Error(err));
        var dbo = db.db("nextbrainDB");
        let coll = dbo.collection(collName);

        resolve(coll);
      })
    });
  },

  // example of async/await function
  getDb: async (collName) => {
    // // mongo db
    const { MongoClient } = require("mongodb");
    const uri = global.DB_URI;
    const dbName = global.DB_NAME;
    console.log('uri', uri);
    console.log('dbName', dbName);

    try {
      const mongoClient = new MongoClient(uri);
      const mongodb = await mongoClient.db(dbName);
      return await mongodb.collection(collName);
    }
    catch (err) {
      console.log('getDb2', 'async', err);
    }
  },

  checkCSRF: (rcv_csrf, session_csrf) => {
    console.log('checkCSRF', `[${rcv_csrf}]`, `[${session_csrf}]`);

    if(session_csrf == '' || rcv_csrf != session_csrf) {
      return {ret:0, msg:'CSRF detected!'};
    }
    else {
      return {ret:1};
    }
  },

  // This accepts rest parameter for an arbitrary amount of arguments
  log: (...msg) => {
    const STACK_FUNC_NAME = new RegExp(/\w+\.\w+:(\d+)/);
    let err = new Error();
    
    Error.captureStackTrace(err);
  
    let stacks = err.stack.split('\n').slice(1);
    // console.log(err.stack);
  
    // In Error trace, caller information is in the second array.
    let callerInfo = STACK_FUNC_NAME.exec(stacks[1]);
    console.log(`${callerInfo[0]}  ${msg}`);
  },
};