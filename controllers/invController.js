const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");
const { validationResult } = require('express-validator');

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId;
    const data = await invModel.getInventoryByClassificationId(classification_id);
    const grid = await utilities.buildClassificationGrid(data);
    let nav = await utilities.getNav();
    const className = data[0]?.classification_name || "Vehicles";
    res.render("./inventory/classification", {
      title: className + " vehicles",
      nav,
      grid,
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Build inventory item detail view
 * ************************** */
invCont.buildByInventoryId = async function (req, res, next) {
  try {
    const inv_id = req.params.inv_id;
    const data = await invModel.getInventoryById(inv_id);
    if (!data) {
      throw new Error("Vehicle not found");
    }
    const grid = await utilities.buildDetailHTML(data);
    let nav = await utilities.getNav();
    res.render("./inventory/detail", {
      title: `${data.inv_make} ${data.inv_model}`,
      nav,
      grid,
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Build management view
 * ************************** */
invCont.buildManagementView = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    res.render("./inventory/management", {
      title: "Inventory Management",
      nav,
      message: req.flash('message') || null,
      errors: []
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Build add classification view
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    res.render("./inventory/add-classification", {
      title: "Add Classification",
      nav,
      message: req.flash('message') || null,
      errors: [],
      classification_name: ''
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Process add classification
 * ************************** */
invCont.addClassification = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    return res.render("./inventory/add-classification", {
      title: "Add New Classification",
      nav,
      message: null,
      errors: errors.array(),
      classification_name: req.body.classification_name
    });
  }

  try {
    const { classification_name } = req.body;
    await invModel.addClassification(classification_name);
    req.flash('message', 'Classification added successfully!');
    res.redirect('/inv/management');
  } catch (error) {
    req.flash('message', 'Failed to add classification');
    next(error);
  }
};

/* ***************************
 *  Build add inventory view
 * ************************** */
invCont.buildAddInventory = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList();
    res.render("./inventory/add-inventory", {
      title: "Add New Inventory",
      nav,
      classificationList,
      message: req.flash('message') || null,
      errors: [],
      inv_make: '',
      inv_model: '',
      inv_year: '',
      inv_description: '',
      inv_image: '/images/vehicles/no-image.png',
      inv_thumbnail: '/images/vehicles/no-image-tn.png',
      inv_price: '',
      inv_miles: '',
      inv_color: '',
      classification_id: null
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Process add inventory
 * ************************** */
invCont.addInventory = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    try {
      let nav = await utilities.getNav();
      const classificationList = await utilities.buildClassificationList(req.body.classification_id);
      return res.render("./inventory/add-inventory", {
        title: "Add New Inventory",
        nav,
        classificationList,
        message: null,
        errors: errors.array(),
        ...req.body
      });
    } catch (error) {
      next(error);
    }
  }

  try {
    const { 
      inv_make, inv_model, inv_year, 
      inv_description, inv_image, inv_thumbnail, 
      inv_price, inv_miles, inv_color, classification_id 
    } = req.body;
    
    await invModel.addInventory({
      inv_make, inv_model, inv_year, 
      inv_description, inv_image, inv_thumbnail, 
      inv_price, inv_miles, inv_color, classification_id
    });
    
    req.flash('message', 'Inventory item added successfully!');
    res.redirect('/inv/management');
  } catch (error) {
    req.flash('message', 'Failed to add inventory item');
    next(error);
  }
};

module.exports = invCont;