// express
const express = require('express');
app = express();
var flash = require('connect-flash');
var fallback = require('express-history-api-fallback')


// middleware
app.use(express.static('public'));
app.use(express.static('/uploads'));
app.use(express.json({limit:'1mb'}));
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(flash());

// This middleware is for 'Refreshing page'
// when refreshing pages on backend(usually, it's the case because we run the app on delpoyment), 
// the backend router doesn't know about frontend router
var root = __dirname + '/public'
app.use(fallback('index.html', { root: root }))

// passport
const passport = require('./lib/passport.js')(app);


//////////////////
// Setting global variables start
//////////////////
global.debug = true;
// when test on Local
// mongodb should be install on local
if(global.debug) {
  console.log('global.debug true');
  global.PORT = 3000;
  global.DB_URI = 'mongodb://0.0.0.0:27017/';
  global.DB_NAME = 'bearmarketDB';
}
// when deploy
// set DB_URI on fly.io Server as a Secret variable
else {
  console.log('global.debug false');
  global.PORT = 3000;
  global.DB_URI = process.env.DB_URI;
  global.DB_NAME = 'bearmarketDB';
}
global.UPLOAD_FOLDER = '/uploads';
console.log('print:', process.env.VUE_APP_ROOT_API);

global.checkLogin = (req) => {
  if(req.user == undefined) {
    return false;
  }
  else {
    return true;
  }
}
//////////////////
// Setting global variables end
//////////////////


// router
app.use('/auth', require('./routes/auth')(passport));
app.use('/user', require('./routes/user'));
app.use('/item', require('./routes/item'));
app.use('/review', require('./routes/review'));
app.use('/admin', require('./routes/admin'));

// start app
const port = global.PORT;
app.listen(port, () => {
    console.log(`listening at ${port}`);
});