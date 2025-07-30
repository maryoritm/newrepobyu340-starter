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
    const classificationSelect = await utilities.buildClassificationList();
    res.render("./inventory/management", {
      title: "Inventory Management",
      nav,
      classificationSelect,
      message: req.flash('message') || null,
      errors: []
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id);
  const invData = await invModel.getInventoryByClassificationId(classification_id);
  if (invData[0]?.inv_id) {
    return res.json(invData);
  } else {
    next(new Error("No data returned"));
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

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.buildEditInventoryView = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id);
    let nav = await utilities.getNav();
    const itemData = await invModel.getInventoryById(inv_id);
    const classificationList = await utilities.buildClassificationList(itemData.classification_id);
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
    
    res.render("./inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationList,
      message: req.flash('message') || null,
      errors: [],
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_description: itemData.inv_description,
      inv_image: itemData.inv_image,
      inv_thumbnail: itemData.inv_thumbnail,
      inv_price: itemData.inv_price,
      inv_miles: itemData.inv_miles,
      inv_color: itemData.inv_color,
      classification_id: itemData.classification_id
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Process inventory update
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    try {
      const inv_id = req.body.inv_id;
      let nav = await utilities.getNav();
      const itemData = await invModel.getInventoryById(inv_id);
      const classificationList = await utilities.buildClassificationList(itemData.classification_id);
      const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
      
      return res.render("./inventory/edit-inventory", {
        title: "Edit " + itemName,
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
      inv_id, inv_make, inv_model, inv_year, 
      inv_description, inv_image, inv_thumbnail, 
      inv_price, inv_miles, inv_color, classification_id 
    } = req.body;
    
    const updateResult = await invModel.updateInventory(
      inv_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id
    );
    
    if (updateResult) {
      req.flash('message', 'Inventory item updated successfully!');
      res.redirect('/inv/management');
    } else {
      throw new Error('Update failed');
    }
  } catch (error) {
    req.flash('message', 'Failed to update inventory item');
    next(error);
  }
};

module.exports = invCont;