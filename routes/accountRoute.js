const express = require("express");
const router = express.Router();
const utilities = require("../utilities");
const accountController = require("../controllers/accountController");
const regValidate = require('../utilities/account-validation')

// GET route for login view
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// GET route for registration view
router.get("/register", utilities.handleErrors(accountController.buildRegister));

// GET route for account management view (protegida por checkLogin)
router.get(
  "/", 
  utilities.checkLogin,
  utilities.handleErrors(accountController.accountManagement)
);

// POST route for registration processing
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

// Process the login attempt
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
);

// GET route for account update view
router.get(
  "/update/:id", 
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildUpdate)
);

// POST route for account update
router.post(
  "/update",
  utilities.checkLogin,
  regValidate.updateRules(),
  regValidate.checkUpdateData,
  utilities.handleErrors(accountController.updateAccount)
);

// POST route for password update
router.post(
  "/update-password",
  utilities.checkLogin,
  regValidate.passwordRules(),
  utilities.handleErrors(accountController.updatePassword)
);

// GET route for logout
router.get(
  "/logout",
  utilities.handleErrors(accountController.accountLogout)
);

module.exports = router;