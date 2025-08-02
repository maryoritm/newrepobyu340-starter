const express = require("express");
const router = express.Router();
const invController = require("../controllers/invController");
const { body } = require('express-validator');
const utilities = require("../utilities/");

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route to build inventory item detail view
router.get("/detail/:inv_id", utilities.handleErrors(invController.buildByInventoryId));

// Management routes - Protegidas para empleados/admins
router.get("/", 
  utilities.checkLogin,
  utilities.checkEmployee,
  utilities.handleErrors(invController.buildManagementView));

router.get("/management", 
  utilities.checkLogin,
  utilities.checkEmployee,
  utilities.handleErrors(invController.buildManagementView));

// Route to get inventory as JSON
router.get("/getInventory/:classification_id", 
  utilities.checkLogin,
  utilities.checkEmployee,
  utilities.handleErrors(invController.getInventoryJSON));

// Classification routes - Protegidas para empleados/admins
router.get("/add-classification", 
  utilities.checkLogin,
  utilities.checkEmployee,
  utilities.handleErrors(invController.buildAddClassification));

router.post(
  "/add-classification",
  utilities.checkLogin,
  utilities.checkEmployee,
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

// Inventory routes - Protegidas para empleados/admins
router.get("/add-inventory", 
  utilities.checkLogin,
  utilities.checkEmployee,
  utilities.handleErrors(invController.buildAddInventory));

router.post(
  "/add-inventory",
  utilities.checkLogin,
  utilities.checkEmployee,
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

// Edit routes - Protegidas para empleados/admins
router.get("/edit/:inv_id", 
  utilities.checkLogin,
  utilities.checkEmployee,
  utilities.handleErrors(invController.buildEditInventoryView));

router.post(
  "/update",
  utilities.checkLogin,
  utilities.checkEmployee,
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
    body('classification_id').notEmpty().withMessage('Classification is required'),
    body('inv_id').notEmpty().withMessage('Inventory ID is required')
  ],
  utilities.handleErrors(invController.updateInventory)
);

// Delete routes - Protegidas para empleados/admins
router.get("/delete/:inv_id", 
  utilities.checkLogin,
  utilities.checkEmployee,
  utilities.handleErrors(invController.buildDeleteConfirm));

router.post("/delete", 
  utilities.checkLogin,
  utilities.checkEmployee,
  utilities.handleErrors(invController.deleteInventoryItem));

module.exports = router;