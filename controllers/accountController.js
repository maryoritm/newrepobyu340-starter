const utilities = require("../utilities");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
    flashMessages: req.flash()
  });
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
    flashMessages: req.flash()
  });
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_password } = req.body;

  // Hash the password before storing
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hashSync(account_password, 10);
  } catch (error) {
    req.flash("error", 'Sorry, there was an error processing the registration.');
    return res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
      flashMessages: req.flash()
    });
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  );

  if (regResult) {
    req.flash(
      "success",
      `Congratulations, you're registered ${account_firstname}. Please log in.`
    );
    return res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      flashMessages: req.flash()
    });
  } else {
    req.flash("error", "Sorry, the registration failed.");
    return res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
      flashMessages: req.flash()
    });
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;
  const accountData = await accountModel.getAccountByEmail(account_email);
  
  if (!accountData) {
    req.flash("error", "Please check your credentials and try again.");
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
      flashMessages: req.flash()
    });
  }
  
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password;
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 });
      
      const cookieOptions = {
        httpOnly: true,
        maxAge: 3600 * 1000
      };
      
      if (process.env.NODE_ENV === 'production') {
        cookieOptions.secure = true;
      }
      
      res.cookie("jwt", accessToken, cookieOptions);
      
      // Set user data in res.locals for views
      res.locals.accountData = accountData;
      
      req.flash("success", `Welcome back, ${accountData.account_firstname}!`);
      return res.redirect("/account/");
    } else {
      req.flash("error", "Please check your credentials and try again.");
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
        flashMessages: req.flash()
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    req.flash("error", "An error occurred during login.");
    return res.status(500).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      flashMessages: req.flash()
    });
  }
}

/* ****************************************
 * Deliver account management view
 * ************************************ */
async function accountManagement(req, res) {
  let nav = await utilities.getNav();
  
  // Ensure accountData is available
  const accountData = res.locals.accountData || await accountModel.getAccountById(req.params.id);
  
  res.render("account/management", {
    title: "Account Management",
    nav,
    errors: null,
    accountData,
    flashMessages: req.flash()
  });
}

/* ****************************************
 *  Deliver account update view
 * ************************************ */
async function buildUpdate(req, res, next) {
  let nav = await utilities.getNav();
  const account_id = req.params.id;
  const accountData = await accountModel.getAccountById(account_id);
  
  res.render("account/update", {
    title: "Update Account",
    nav,
    errors: null,
    accountData,
    flashMessages: req.flash()
  });
}

/* ****************************************
 *  Process account update
 * ************************************ */
async function updateAccount(req, res) {
  let nav = await utilities.getNav();
  const { account_id, account_firstname, account_lastname, account_email } = req.body;
  
  // Validación básica
  const errors = [];
  if (!account_firstname) errors.push({ msg: "First name is required" });
  if (!account_lastname) errors.push({ msg: "Last name is required" });
  if (!account_email) errors.push({ msg: "Email is required" });
  
  if (errors.length > 0) {
    return res.render("account/update", {
      title: "Update Account",
      nav,
      errors,
      accountData: req.body,
      flashMessages: req.flash()
    });
  }
  
  try {
    const updateResult = await accountModel.updateAccount(
      account_id,
      account_firstname,
      account_lastname,
      account_email
    );
    
    if (updateResult) {
      // Actualizar token si el email cambió
      const accountData = await accountModel.getAccountById(account_id);
      delete accountData.account_password;
      
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 });
      
      const cookieOptions = {
        httpOnly: true,
        maxAge: 3600 * 1000
      };
      
      if (process.env.NODE_ENV === 'production') {
        cookieOptions.secure = true;
      }
      
      res.cookie("jwt", accessToken, cookieOptions);
      
      req.flash("success", "Account updated successfully");
      return res.redirect("/account/");
    } else {
      req.flash("error", "Sorry, the update failed");
      return res.redirect("/account/update/" + account_id);
    }
  } catch (error) {
    console.error("Update error:", error);
    req.flash("error", "An error occurred during update.");
    return res.redirect("/account/update/" + account_id);
  }
}

/* ****************************************
 *  Process password update
 * ************************************ */
async function updatePassword(req, res) {
  let nav = await utilities.getNav();
  const { account_id, account_password } = req.body;
  
  // Validar contraseña
  if (!account_password || account_password.length < 12) {
    req.flash("error", "Password must be at least 12 characters");
    return res.redirect("/account/update/" + account_id);
  }
  
  // Hash la nueva contraseña
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hashSync(account_password, 10);
  } catch (error) {
    req.flash("error", "Error processing password");
    return res.redirect("/account/update/" + account_id);
  }
  
  try {
    const updateResult = await accountModel.updatePassword(account_id, hashedPassword);
    
    if (updateResult) {
      req.flash("success", "Password updated successfully");
      return res.redirect("/account/");
    } else {
      req.flash("error", "Sorry, the password update failed");
      return res.redirect("/account/update/" + account_id);
    }
  } catch (error) {
    console.error("Password update error:", error);
    req.flash("error", "An error occurred during password update.");
    return res.redirect("/account/update/" + account_id);
  }
}

/* ****************************************
 *  Process logout
 * ************************************ */
async function accountLogout(req, res) {
  res.clearCookie("jwt");
  req.flash("success", "You have been logged out");
  res.redirect("/");
}

module.exports = { 
  buildLogin, 
  buildRegister, 
  registerAccount,
  accountLogin,
  accountManagement,
  buildUpdate,
  updateAccount,
  updatePassword,
  accountLogout
};