import mariaDB from 'mariadb';
import dotenv from 'dotenv';

dotenv.config();

const pool = mariaDB.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 5,
  connectTimeout: 10000, 
  acquireTimeout: 10000,
  ssl: {
    rejectUnauthorized: false 
  }
});

export const getConnection = async () => {
  return await pool.getConnection();
};