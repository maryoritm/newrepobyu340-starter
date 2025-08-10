/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const env = require("dotenv").config();
const app = express();
const session = require("express-session");
const pool = require('./database/');
const flash = require('connect-flash');
const messages = require('express-messages');
const cookieParser = require("cookie-parser");

// Routes
const static = require("./routes/static");
const baseController = require("./controllers/baseController");
const inventoryRoute = require("./routes/inventoryRoute");
const accountRoute = require("./routes/accountRoute");
const utilities = require("./utilities/");
const reviewRoutes = require("./routes/reviewRoutes");

/* ***********************
 * Middleware
 * ************************/
// Session configuration
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    pool,
    createTableIfMissing: true,
    pruneSessionInterval: 60 * 60
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  name: 'sessionId',
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    secure: false, // Change to true in production
    httpOnly: true,
    sameSite: 'lax',
    domain: 'localhost' // ESSENTIAL for development
  }
}));

// Flash messages middleware
app.use(flash());

// Make flash messages available to all views
app.use((req, res, next) => {
  res.locals.messages = messages(req, res);
  res.locals.errors = [];
  res.locals.classification_name = '';
  next();
});

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(utilities.checkJWTToken);

// Static files
app.use(express.static('public'));

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout");

/* ***********************
 * Routes
 *************************/
app.use(static);
app.use("/account", accountRoute);
app.use("/inv", inventoryRoute);
app.use("/reviews", reviewRoutes);

// Index route
app.get("/", utilities.handleErrors(baseController.buildHome));

// Route to test 500 errors
app.get("/errors/trigger-error", (req, res, next) => {
  next({
    status: 500, 
    message: 'This is a test error (500) triggered intentionally'
  });
});

// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({status: 404, message: 'Sorry, we appear to have lost that page.'});
});

/* ***********************
* Express Error Handler
*************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav();
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);
  
  let message;
  if(err.status == 404) {
    message = err.message;
  } else if(err.status == 500) {
    message = 'Internal Server Error: ' + err.message;
  } else {
    message = 'Oh no! There was a crash. Maybe try a different route?';
  }
  
  res.status(err.status || 500).render("errors/error", {
    title: err.status || 'Server Error',
    message,
    nav,
    errorCode: err.status
  });
});

/* ***********************
 * Server Configuration
 *************************/
const port = process.env.PORT || 5500;
const host = process.env.HOST || 'localhost';

app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`);
});