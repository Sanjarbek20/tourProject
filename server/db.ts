import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from "@shared/schema";



// Create a MySQL connection pool
export const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '0320',
  database: 'dildoratour',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export const db = drizzle(pool, { schema, mode: 'default' });
