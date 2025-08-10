const reviewModel = require("../models/reviewModel");

const reviewController = {
  showReviews: async (req, res, next) => {
    try {
      const vehicleId = parseInt(req.params.id);
      const reviews = await reviewModel.getReviewsByVehicle(vehicleId);
      res.json({ reviews });
    } catch (error) {
      next(error);
    }
  },

  createReview: async (req, res, next) => {
    try {
      console.log('Session in controller:', req.session); // Debugging
      
      if (!req.session.account?.account_id) {
        return res.status(403).json({ 
          error: "Invalid or expired session",
          redirect: "/account/login"
        });
      }

      const { vehicle_id, rating, comment } = req.body;
      const account_id = req.session.account.account_id;

      // Data validation
      if (!vehicle_id || !rating || !comment) {
        return res.status(400).json({
          error: "All fields are required"
        });
      }

      const result = await reviewModel.addReview({
        vehicle_id: parseInt(vehicle_id),
        account_id: parseInt(account_id),
        rating: parseInt(rating),
        comment: comment.trim()
      });

      res.json({ 
        success: true,
        review_id: result.review_id
      });
    } catch (error) {
      console.error("Error in createReview:", error);
      next(error);
    }
  }
};

module.exports = reviewController;