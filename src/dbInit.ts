import pkg from 'pg';
const { Client } = pkg;
import type { Client as PgClient } from 'pg';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import logger from './utils/logger.js';
import dotenv from 'dotenv';

dotenv.config();

const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;

const adminClient = new Client({
  connectionString: process.env.ADMIN_DATABASE_URL
});

async function initializeTables(dbClient: PgClient): Promise<void> {
  const tablesExist = await dbClient.query(`
    SELECT to_regclass('public.users') IS NOT NULL AS users_exists,
           to_regclass('public.transactions') IS NOT NULL AS transactions_exists;
  `);

  const { users_exists, transactions_exists } = tablesExist.rows[0];

  if (!users_exists || !transactions_exists) {
    logger.info("Creating tables...");
    const initSQL = fs.readFileSync('./init.sql', 'utf-8');
    await dbClient.query(initSQL);
    logger.info("Tables created successfully!");
  } else {
    logger.info("Tables already exist.");
  }
}

async function seedMockUsersIfNotExists(dbClient: PgClient): Promise<void> {
  const usersExist = await dbClient.query(`SELECT 1 FROM users LIMIT 1`);

  if (usersExist.rowCount === 0) {
    logger.info("Seeding mock users...");
    for (let i = 1; i <= 100; i++) {
      const username = `User${i.toString().padStart(4, '0')}`;
      const email = `user${i}@example.com`;
      const password = i.toString().padStart(4, '0');
      const hashedPassword = await bcrypt.hash(password, 10);

      try {
        await dbClient.query(
          `INSERT INTO users (username, email, password, balance) VALUES ($1, $2, $3, $4)`,
          [username, email, hashedPassword, parseInt(process.env.WELCOME_BONUS || '500')]
        );
        logger.info(`Inserted mock user: ${username}`);
      } catch (error) {
        logger.error(`Error inserting user ${username}:`, error);
      }
    }
  } else {
    logger.info("Mock users already exist.");
  }
}

async function initializeDatabase(): Promise<void> {
  try {
    logger.info("Attempting to connect to the admin database...");
    await adminClient.connect();

    const userExists = await adminClient.query(`SELECT 1 FROM pg_roles WHERE rolname=$1`, [dbUser]);
    if (userExists.rowCount === 0) {
      logger.info(`Database user "${dbUser}" does not exist. Creating...`);
      await adminClient.query(`CREATE USER ${dbUser} WITH PASSWORD '${dbPassword}'`);
      logger.info(`Database user "${dbUser}" created successfully!`);
    } else {
      logger.info(`Database user "${dbUser}" already exists.`);
    }

    const dbExists = await adminClient.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]);
    if (dbExists.rowCount === 0) {
      logger.info(`Database "${dbName}" does not exist. Creating...`);
      await adminClient.query(`CREATE DATABASE ${dbName} OWNER ${dbUser}`);
      await adminClient.query(`GRANT ALL PRIVILEGES ON DATABASE ${dbName} TO ${dbUser}`);
      logger.info(`Database "${dbName}" created successfully with user "${dbUser}" as owner!`);
    } else {
      logger.info(`Database "${dbName}" already exists.`);
    }

    await adminClient.end();

    const dbClient = new Client({
      connectionString: process.env.DATABASE_URL
    });
    logger.info("Connecting to new database with new user...");
    await dbClient.connect();

    await initializeTables(dbClient);
    await seedMockUsersIfNotExists(dbClient);
    await dbClient.end();

  } catch (error) {
    logger.error('Error initializing database:', error);
  } finally {
    await adminClient.end();
  }
}

initializeDatabase();