const pool = require("../database/");

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name");
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
       JOIN public.classification AS c 
       ON i.classification_id = c.classification_id 
       WHERE i.classification_id = $1`,
      [classification_id]
    );
    return data.rows;
  } catch (error) {
    console.error("getclassificationsbyid error " + error);
    return [];
  }
}

/* ***************************
 *  Get single inventory item by id
 * ************************** */
async function getInventoryById(inv_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory WHERE inv_id = $1`,
      [inv_id]
    );
    return data.rows[0];
  } catch (error) {
    console.error("getInventoryById error " + error);
    return null;
  }
}

/* ***************************
 *  Add new classification
 * ************************** */
async function addClassification(classification_name) {
  try {
    const sql = "INSERT INTO classification (classification_name) VALUES ($1) RETURNING *";
    return await pool.query(sql, [classification_name]);
  } catch (error) {
    console.error("addClassification error " + error);
    throw error;
  }
}

/* ***************************
 *  Add new inventory item
 * ************************** */
async function addInventory(
  inv_make,
  inv_model,
  inv_year,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price,
  inv_miles,
  inv_color,
  classification_id
) {
  try {
    // Validación de campos requeridos
    if (!inv_make || !inv_model || !inv_year || !inv_description || 
        !inv_image || !inv_thumbnail || !inv_price || !inv_miles || 
        !inv_color || !classification_id) {
      throw new Error("Todos los campos son requeridos");
    }

    const sql = `INSERT INTO inventory (
      inv_make, inv_model, inv_year, inv_description, 
      inv_image, inv_thumbnail, inv_price, inv_miles, 
      inv_color, classification_id
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`;
    
    return await pool.query(sql, [
      inv_make.trim(),
      inv_model.trim(),
      parseInt(inv_year),
      inv_description.trim(),
      inv_image.trim(),
      inv_thumbnail.trim(),
      parseFloat(inv_price),
      parseInt(inv_miles),
      inv_color.trim(),
      parseInt(classification_id)
    ]);
  } catch (error) {
    console.error("addInventory error " + error);
    throw error;
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(
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
) {
  try {
    const sql =
      `UPDATE public.inventory 
       SET inv_make = $1, inv_model = $2, inv_description = $3, 
           inv_image = $4, inv_thumbnail = $5, inv_price = $6, 
           inv_year = $7, inv_miles = $8, inv_color = $9, 
           classification_id = $10 
       WHERE inv_id = $11 
       RETURNING *`;
    
    const data = await pool.query(sql, [
      inv_make.trim(),
      inv_model.trim(),
      inv_description.trim(),
      inv_image.trim(),
      inv_thumbnail.trim(),
      parseFloat(inv_price),
      parseInt(inv_year),
      parseInt(inv_miles),
      inv_color.trim(),
      parseInt(classification_id),
      parseInt(inv_id)
    ]);
    return data.rows[0];
  } catch (error) {
    console.error("model error: " + error);
    throw error;
  }
}

/* ***************************
 *  Delete Inventory Item
 * ************************** */
async function deleteInventoryItem(inv_id) {
  try {
    const sql = 'DELETE FROM inventory WHERE inv_id = $1';
    const data = await pool.query(sql, [inv_id]);
    return data;
  } catch (error) {
    console.error("deleteInventoryItem error " + error);
    throw error;
  }
}

module.exports = { 
  getClassifications, 
  getInventoryByClassificationId,
  getInventoryById,
  addClassification,
  addInventory,
  updateInventory,
  deleteInventoryItem
};