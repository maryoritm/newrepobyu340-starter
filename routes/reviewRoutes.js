const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const utilities = require("../utilities");

// Middleware to validate session
const validateSession = async (req, res, next) => {
  try {
    if (!req.session.account?.account_id) {
      console.log('Invalid session. Session data:', req.session);
      return res.status(403).json({ 
        error: "You must be logged in to submit a review",
        redirect: "/account/login"
      });
    }
    next();
  } catch (error) {
    console.error('Error in validateSession:', error);
    next(error);
  }
};

// Get reviews for a vehicle
router.get("/:id", 
  utilities.handleErrors(reviewController.showReviews)
);

// Add a new review (protected route)
router.post("/add", 
  validateSession,
  utilities.handleErrors(reviewController.createReview)
);

module.exports = router;