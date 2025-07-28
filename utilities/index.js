const invModel = require("../models/inventory-model");
const Util = {};

// Cache variables
let cachedNav = null;
let lastNavUpdate = 0;
const CACHE_DURATION = 300000; // 5 minutes in milliseconds

/* ************************
 * Constructs the nav HTML unordered list with caching
 ************************** */
Util.getNav = async function () {
  const now = Date.now();
  
  if (!cachedNav || now - lastNavUpdate > CACHE_DURATION) {
    try {
      const data = await invModel.getClassifications();
      let list = "<ul>";
      list += '<li><a href="/" title="Home page">Home</a></li>';
      
      data.rows.forEach((row) => {
        list += `<li>
          <a href="/inv/type/${row.classification_id}" 
             title="See our inventory of ${row.classification_name} vehicles">
            ${row.classification_name}
          </a>
        </li>`;
      });
      
      list += "</ul>";
      cachedNav = list;
      lastNavUpdate = now;
    } catch (error) {
      console.error("Error building navigation:", error);
      return "<ul><li><a href='/'>Home</a></li></ul>";
    }
  }
  
  return cachedNav;
};

/* ****************************************
 * Middleware For Handling Errors
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/* **************************************
 * Build the classification view HTML
 * ************************************ */
Util.buildClassificationGrid = async function(data) {
  if (!data || data.length === 0) {
    return '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }

  let grid = '<ul id="inv-display">';
  
  data.forEach(vehicle => {
    grid += `
      <li>
        <a href="../../inv/detail/${vehicle.inv_id}" 
           title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
          <img src="${vehicle.inv_thumbnail}" 
               alt="Image of ${vehicle.inv_make} ${vehicle.inv_model} on CSE Motors">
        </a>
        <div class="namePrice">
          <hr />
          <h2>
            <a href="../../inv/detail/${vehicle.inv_id}" 
               title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
              ${vehicle.inv_make} ${vehicle.inv_model}
            </a>
          </h2>
          <span>$${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}</span>
        </div>
      </li>`;
  });
  
  grid += '</ul>';
  return grid;
};

/* **************************************
 * Build the inventory detail view HTML
 * ************************************ */
Util.buildDetailHTML = async function(data) {
  return `
    <div class="detail-container">
      <div class="detail-image">
        <img src="${data.inv_image}" alt="${data.inv_make} ${data.inv_model}">
      </div>
      <div class="detail-info">
        <h2>${data.inv_year} ${data.inv_make} ${data.inv_model}</h2>
        <p><strong>Price:</strong> $${new Intl.NumberFormat('en-US').format(data.inv_price)}</p>
        <p><strong>Mileage:</strong> ${new Intl.NumberFormat('en-US').format(data.inv_miles)} miles</p>
        <p><strong>Color:</strong> ${data.inv_color}</p>
        <p><strong>Description:</strong> ${data.inv_description}</p>
      </div>
    </div>
  `;
};

/* **************************************
 * Build classification select list
 * ************************************ */
Util.buildClassificationList = async function (classification_id = null) {
  try {
    const data = await invModel.getClassifications();
    let classificationList = `
      <select name="classification_id" id="classificationList" required>
        <option value="">Choose a Classification</option>
    `;
    
    data.rows.forEach((row) => {
      const selected = classification_id != null && row.classification_id == classification_id ? "selected" : "";
      classificationList += `
        <option value="${row.classification_id}" ${selected}>
          ${row.classification_name}
        </option>
      `;
    });
    
    classificationList += "</select>";
    return classificationList;
  } catch (error) {
    console.error("Error building classification list:", error);
    return '<select name="classification_id" required><option value="">Error loading classifications</option></select>';
  }
};

module.exports = Util;