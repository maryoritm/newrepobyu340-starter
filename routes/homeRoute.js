const express = require("express");
const router = express.Router();

// Error test route
router.get("/trigger-error", (req, res, next) => {
  const error = new Error("Intentional server error for testing purposes");
  error.status = 500;
  error.testError = true;
  next(error);
});

module.exports = router;