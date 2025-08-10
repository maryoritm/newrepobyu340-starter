const pool = require("../database/");

async function getReviewsByVehicle(vehicleId) {
  const sql = `
    SELECT r.review_id, r.rating, r.comment, r.created_at, a.account_firstname, a.account_lastname
    FROM public.reviews r
    JOIN public.account a ON r.account_id = a.account_id
    WHERE r.vehicle_id = $1
    ORDER BY r.created_at DESC
  `;
  const result = await pool.query(sql, [vehicleId]);
  return result.rows;
}

async function addReview({ vehicle_id, account_id, rating, comment }) {
  try {
    if (!validateReview(rating, comment)) {
      throw new Error("Datos inválidos para la reseña.");
    }
    
    const sql = `
      INSERT INTO public.reviews (vehicle_id, account_id, rating, comment)
      VALUES ($1, $2, $3, $4)
      RETURNING review_id
    `;
    const result = await pool.query(sql, [vehicle_id, account_id, rating, comment]);
    return result.rows[0];
  } catch (error) {
    console.error("Error en addReview:", error);
    throw error;
  }
}

function validateReview(rating, comment) {
  return (
    Number.isInteger(rating) &&
    rating >= 1 &&
    rating <= 5 &&
    typeof comment === "string" &&
    comment.trim().length > 0
  );
}

module.exports = {
  getReviewsByVehicle,
  addReview,
  validateReview
};