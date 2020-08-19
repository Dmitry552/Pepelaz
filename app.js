var express = require('express');
var favicon = require('serve-favicon');
var bodyParser = require('body-parser');
var path = require('path');
var config = require('./config');
var staticAsset = require('static-asset');
var mongoose = require('mongoose');
var routes = require('./routes');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

//database
mongoose.Promise = global.Promise;
mongoose.set('debug', config.IS_PRODUCTION);
mongoose.set('useFindAndModify', false);
mongoose.connection
  .on('error', error => console.log(error))
  .on('close', () => console.log('Database connection closed.'))
  .once('open', () => {
    var info = mongoose.connections[0];
    console.log(`Connected to ${info.host}:${info.port}/${info.name}`);
    //require('./mocks')();
  });
mongoose.connect(config.MONGO_URL, {useNewUrlParser: true, useUnifiedTopology: true});

//express
var app = express();

//sessions
app.use(
  session({
    secret: config.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({
      mongooseConnection: mongoose.connection
    })
  })
);
 
//sets end usee
app.set('view engine', 'ejs');
app.use(favicon(path.join(__dirname, 'public', 'fav.ico')));
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());
app.use(staticAsset(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/post', express.static(path.join(__dirname, 'public')));
app.use('/posts', express.static(path.join(__dirname, 'public')));
app.use('/archive', express.static(path.join(__dirname, 'public')));
app.use('/users', express.static(path.join(__dirname, 'public')));
app.use('/post/edit', express.static(path.join(__dirname, 'public')));
//app.use('/comment', express.static(path.join(__dirname, 'public')));
//app.use('/post/edit/upload', express.static(path.join(__dirname, 'public')));
//console.log(__dirname);
//app.use('/uploads', express.static(path.join(__dirname, config.DESTINATION)));
app.use(
  '/javascripts', 
  express.static(path.join(__dirname, 'node_modules', 'jquery', 'dist'))
);

//routes
app.use('/', routes.archive);
app.use('/api/auth/', routes.auth);
app.use('/post/', routes.post);
app.use('/archive/', routes.archive);
app.use('/comment/', routes.comment);
app.use('/upload/', routes.upload);

//catch 404 and forward to error handler
app.use((req, res, next) => {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

//error handler
app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.render('error', {
    message: error.message,
    error: (!(process.env.NODE_ENV === config.IS_PRODUCTION)) ? error : {},
  });
  //next();
});

app.listen(config.PORT, () => console.log(`Exampl app listening on port ${config.PORT}!`));