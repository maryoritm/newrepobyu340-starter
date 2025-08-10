module.exports = {
    validateReviewData: (req, res, next) => {
        const { vehicle_id, rating, comment } = req.body;
        const errors = [];

        if (!vehicle_id || isNaN(vehicle_id)) {
            errors.push("Invalid vehicle ID");
        }

        if (!rating || isNaN(rating) || rating < 1 || rating > 5) {
            errors.push("Rating must be between 1 and 5");
        }

        if (!comment || comment.trim().length < 10) {
            errors.push("Comment must be at least 10 characters");
        }

        if (errors.length > 0) {
            if (req.headers['content-type'] === 'application/json') {
                return res.status(400).json({ errors });
            }
            // For non-AJAX requests (though your form will now be AJAX)
            req.flash('error', errors);
            return res.redirect('back');
        }

        // Convert to proper types
        req.body.vehicle_id = parseInt(vehicle_id);
        req.body.rating = parseInt(rating);
        req.body.comment = comment.trim();

        next();
    }
};