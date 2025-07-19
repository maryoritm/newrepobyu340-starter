const utilities = require("../utilities/")

async function errorHandler(err, req, res, next) {
  let statusCode = err.status || 500;
  let message = err.message || "Internal Server Error";
  
  console.error(`Error: ${statusCode} - ${message}`);
  
  const nav = await utilities.getNav();
  
  res.status(statusCode).render("errors/error", {
    title: `${statusCode} Error`,
    message,
    nav
  });
}

module.exports = errorHandler;