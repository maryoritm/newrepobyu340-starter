const utilities = require("../utilities");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res) {
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
async function buildRegister(req, res) {
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

  try {
    const hashedPassword = bcrypt.hashSync(account_password, 10);

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
  } catch (error) {
    console.error("Registration error:", error);
    req.flash("error", "Sorry, there was an error processing the registration.");
    return res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
      flashMessages: req.flash()
    });
  }
}

/* ****************************************
*  Process login request
* *************************************** */
async function accountLogin(req, res) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;
  
  try {
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
    
    const passwordMatch = await bcrypt.compare(account_password, accountData.account_password);
    
    if (!passwordMatch) {
      req.flash("error", "Please check your credentials and try again.");
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
        flashMessages: req.flash()
      });
    }

    const safeAccountData = { ...accountData };
    delete safeAccountData.account_password;

    req.session.regenerate((err) => {
      if (err) {
        console.error("Error regenerating session:", err);
        req.flash("error", "Session error");
        return res.status(500).render("account/login", {
          title: "Login",
          nav,
          errors: null,
          flashMessages: req.flash()
        });
      }

      req.session.account = {
        account_id: safeAccountData.account_id,
        firstname: safeAccountData.account_firstname,
        lastname: safeAccountData.account_lastname,
        email: safeAccountData.account_email,
        loggedin: true
      };

      req.session.save((err) => {
        if (err) {
          console.error("Error saving session:", err);
          req.flash("error", "Session save error");
          return res.status(500).render("account/login", {
            title: "Login",
            nav,
            errors: null,
            flashMessages: req.flash()
          });
        }

        const accessToken = jwt.sign(safeAccountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 });

        res.cookie("jwt", accessToken, { 
          httpOnly: true, 
          maxAge: 3600 * 1000,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        });

        req.flash("success", `Welcome back, ${safeAccountData.account_firstname}!`);
        return res.redirect("/account/");
      });
    });

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
async function buildUpdate(req, res) {
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
      const accountData = await accountModel.getAccountById(account_id);
      const safeAccountData = { ...accountData };
      delete safeAccountData.account_password;
      
      const accessToken = jwt.sign(safeAccountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 });
      
      res.cookie("jwt", accessToken, {
        httpOnly: true,
        maxAge: 3600 * 1000,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
      
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
  const { account_id, account_password } = req.body;
  
  if (!account_password || account_password.length < 12) {
    req.flash("error", "Password must be at least 12 characters");
    return res.redirect("/account/update/" + account_id);
  }
  
  try {
    const hashedPassword = bcrypt.hashSync(account_password, 10);
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
* *************************************** */
async function accountLogout(req, res) {
  // Guardamos el mensaje flash ANTES de destruir la sesión
  req.flash("success", "You have been logged out");

  req.session.destroy(err => {
    if (err) {
      console.error("Error destroying session:", err);
    }
    res.clearCookie("connect.sid"); // cookie de sesión por defecto
    res.clearCookie("jwt");
    res.redirect("/");
  });
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
