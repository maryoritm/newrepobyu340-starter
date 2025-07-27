const express = require("express");
const router = express.Router();
const utilities = require("../utilities");
const accountController = require("../controllers/accountController");

// GET route for login view
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// GET route for registration view
router.get("/register", utilities.handleErrors(accountController.buildRegister));

// POST route for registration processing
router.post('/register', utilities.handleErrors(accountController.registerAccount));

module.exports = router;