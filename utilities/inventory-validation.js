const { body, validationResult } = require('express-validator');

/* ***************************
 * Classification Validation Rules
 * ************************** */
const classificationRules = () => {
  return [
    body('classification_name')
      .trim()
      .isLength({ min: 1 })
      .withMessage('Please provide a classification name.')
      .matches(/^[a-zA-Z0-9]+$/)
      .withMessage('Classification name has non-alphanumeric characters.')
  ]
}

/* ***************************
 * Inventory Validation Rules
 * ************************** */
const inventoryRules = () => {
  return [
    body('inv_make')
      .trim()
      .isLength({ min: 3 })
      .withMessage('Please provide a make with at least 3 characters.'),
    body('inv_model')
      .trim()
      .isLength({ min: 3 })
      .withMessage('Please provide a model with at least 3 characters.'),
    body('inv_year')
      .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
      .withMessage('Please provide a valid year.'),
    body('inv_description')
      .trim()
      .isLength({ min: 10 })
      .withMessage('Please provide a description with at least 10 characters.'),
    body('inv_image')
      .trim()
      .isLength({ min: 1 })
      .withMessage('Please provide an image path.'),
    body('inv_thumbnail')
      .trim()
      .isLength({ min: 1 })
      .withMessage('Please provide a thumbnail path.'),
    body('inv_price')
      .isFloat({ min: 0 })
      .withMessage('Please provide a valid price.'),
    body('inv_miles')
      .isInt({ min: 0 })
      .withMessage('Please provide valid mileage.'),
    body('inv_color')
      .trim()
      .isLength({ min: 1 })
      .withMessage('Please provide a color.'),
    body('classification_id')
      .isInt({ min: 1 })
      .withMessage('Please select a classification.')
  ]
}

/* ***************************
 * Check Classification Data
 * ************************** */
const checkClassificationData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    return res.render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: errors.array(),
      classification_name: req.body.classification_name
    });
  }
  next();
}

/* ***************************
 * Check Inventory Data
 * ************************** */
const checkInventoryData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList();
    return res.render("inventory/add-inventory", {
      title: "Add New Inventory",
      nav,
      classificationList,
      errors: errors.array(),
      ...req.body
    });
  }
  next();
}

/* ***************************
 * Check Update Data
 * ************************** */
const checkUpdateData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList(req.body.classification_id);
    const itemName = `${req.body.inv_make} ${req.body.inv_model}`;
    return res.render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationList,
      errors: errors.array(),
      ...req.body
    });
  }
  next();
}

module.exports = {
  classificationRules,
  inventoryRules,
  checkClassificationData,
  checkInventoryData,
  checkUpdateData
};