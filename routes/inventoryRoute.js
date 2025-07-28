const express = require("express");
const router = express.Router();
const invController = require("../controllers/invController");
const { body } = require('express-validator');
const utilities = require("../utilities/");

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route to build inventory item detail view
router.get("/detail/:inv_id", utilities.handleErrors(invController.buildByInventoryId));

// Management routes
router.get("/", utilities.handleErrors(invController.buildManagementView));
router.get("/management", utilities.handleErrors(invController.buildManagementView));


// Classification routes
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification));
router.post(
  "/add-classification",
  [
    body('classification_name')
      .trim()
      .isAlphanumeric()
      .withMessage('Classification name must contain only letters and numbers')
      .notEmpty()
      .withMessage('Classification name is required')
      .escape()
  ],
  utilities.handleErrors(invController.addClassification)
);

// Inventory routes
router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventory));
router.post(
  "/add-inventory",
  [
    body('inv_make').trim().notEmpty().withMessage('Make is required').escape(),
    body('inv_model').trim().notEmpty().withMessage('Model is required').escape(),
    body('inv_year')
      .isInt({ min: 1900, max: new Date().getFullYear() })
      .withMessage('Valid year is required'),
    body('inv_price')
      .isFloat({ min: 0 })
      .withMessage('Valid price is required'),
    body('inv_miles')
      .isInt({ min: 0 })
      .withMessage('Valid mileage is required'),
    body('inv_color').trim().notEmpty().withMessage('Color is required').escape(),
    body('inv_description').trim().notEmpty().withMessage('Description is required').escape(),
    body('classification_id').notEmpty().withMessage('Classification is required')
  ],
  utilities.handleErrors(invController.addInventory)
);

module.exports = router;