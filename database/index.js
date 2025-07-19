const { Pool } = require("pg");
require("dotenv").config();

/* ***************
 * Connection Pool
 * Configuración para desarrollo y producción
 * *************** */
let pool;

if (process.env.NODE_ENV === "development") {
  // Configuración para desarrollo local
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
} else {
  // Configuración para producción (Render.com)
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false, // Más seguro para producción
    },
  });
}

// Función para ejecutar queries con logging (útil en desarrollo)
module.exports = {
  async query(text, params) {
    try {
      const res = await pool.query(text, params);
      if (process.env.NODE_ENV === "development") {
        console.log("executed query", { text });
      }
      return res;
    } catch (error) {
      console.error("error in query", { text, error });
      throw error;
    }
  },
};