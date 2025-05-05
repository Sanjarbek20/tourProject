import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from "@shared/schema";

// For development, use in-memory MySQL compatible database
// In production, we would use actual MySQL connection

// Create a MySQL connection pool
export const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'dildora_tour',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export const db = drizzle(pool, { schema, mode: 'default' });
