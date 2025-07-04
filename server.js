/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts");
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs"); // Configura EJS como motor de plantillas
app.use(expressLayouts); // Habilita el uso de layouts
app.set("layout", "./layouts/layout"); // Ruta del layout base (dentro de views/)


/* ***********************
 * Routes
 *************************/
app.use(static)


// Index route
app.get('/', function(req, res) {
  res.render('index', {title: 'Home' // Pasa el título al partial 'head.ejs'
});
});


/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
