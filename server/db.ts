import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import logger, { LogCategory } from './logger';

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create connection pool
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
});

// Log database connection
logger.info(LogCategory.DATABASE, 'Database connection established');

// Add query logging 
const originalQuery = pool.query;
pool.query = function (...args: any[]) {
  const startTime = Date.now();
  const query = args[0];
  const params = args.length > 1 ? args[1] : undefined;
  
  logger.debug(LogCategory.DATABASE, 'Executing query', { query, params });
  
  const result = originalQuery.apply(this, args as any);
  
  result.then(() => {
    const duration = Date.now() - startTime;
    logger.sql(query, params, duration);
  }).catch((error) => {
    logger.error(LogCategory.DATABASE, 'Query error', { query, params, error });
  });
  
  return result;
};

// Create drizzle instance with schema
export const db = drizzle({ client: pool, schema });

// Log drizzle ORM initialization
logger.info(LogCategory.DATABASE, 'Drizzle ORM initialized with schema');
