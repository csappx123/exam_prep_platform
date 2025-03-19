/**
 * Logger utility for the exam platform
 * Provides functions to log various types of events throughout the application
 */

import fs from 'fs';
import path from 'path';
import util from 'util';
import { Request, Response, NextFunction } from 'express';

// Define log levels
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  SQL = 'SQL',
}

// Define log categories
export enum LogCategory {
  SERVER = 'SERVER',
  DATABASE = 'DATABASE',
  AUTH = 'AUTH',
  REQUEST = 'REQUEST',
  RESPONSE = 'RESPONSE',
  EXAM = 'EXAM',
  QUESTION = 'QUESTION',
  USER = 'USER',
  SYSTEM = 'SYSTEM',
}

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Log file paths
const serverLogPath = path.join(logsDir, 'server.log');
const sqlLogPath = path.join(logsDir, 'sql.log');
const errorLogPath = path.join(logsDir, 'error.log');

/**
 * Format a log message
 * @param level Log level
 * @param category Log category
 * @param message Log message
 * @param details Optional details for additional context
 * @returns Formatted log string
 */
function formatLogMessage(
  level: LogLevel,
  category: LogCategory,
  message: string,
  details?: any
): string {
  const timestamp = new Date().toISOString();
  let logString = `[${timestamp}] [${level}] [${category}] ${message}`;
  
  if (details) {
    if (typeof details === 'object') {
      logString += `\n${util.inspect(details, { depth: 4 })}`;
    } else {
      logString += `\n${details}`;
    }
  }
  
  return logString;
}

/**
 * Write a log entry to the appropriate log file
 * @param level Log level
 * @param category Log category
 * @param message Log message
 * @param details Optional details for additional context
 */
function writeLog(
  level: LogLevel,
  category: LogCategory,
  message: string,
  details?: any
): void {
  const logString = formatLogMessage(level, category, message, details);
  
  // Always log to console
  console.log(logString);
  
  // Write to the appropriate log file
  try {
    if (level === LogLevel.SQL) {
      fs.appendFileSync(sqlLogPath, logString + '\n');
    } else if (level === LogLevel.ERROR) {
      fs.appendFileSync(errorLogPath, logString + '\n');
    }
    
    // Always write to main server log
    fs.appendFileSync(serverLogPath, logString + '\n');
  } catch (error) {
    console.error('Failed to write to log file:', error);
  }
}

/**
 * Log functions for different levels
 */
export const logger = {
  /**
   * Log debug messages
   * @param category Log category
   * @param message Log message
   * @param details Optional details
   */
  debug: (category: LogCategory, message: string, details?: any) => {
    writeLog(LogLevel.DEBUG, category, message, details);
  },
  
  /**
   * Log informational messages
   * @param category Log category
   * @param message Log message
   * @param details Optional details
   */
  info: (category: LogCategory, message: string, details?: any) => {
    writeLog(LogLevel.INFO, category, message, details);
  },
  
  /**
   * Log warning messages
   * @param category Log category
   * @param message Log message
   * @param details Optional details
   */
  warn: (category: LogCategory, message: string, details?: any) => {
    writeLog(LogLevel.WARN, category, message, details);
  },
  
  /**
   * Log error messages
   * @param category Log category
   * @param message Log message
   * @param details Optional details
   */
  error: (category: LogCategory, message: string, details?: any) => {
    writeLog(LogLevel.ERROR, category, message, details);
  },
  
  /**
   * Log SQL queries
   * @param query SQL query string
   * @param params Query parameters
   * @param duration Query execution time in milliseconds
   */
  sql: (query: string, params?: any, duration?: number) => {
    let message = `Query executed`;
    if (duration !== undefined) {
      message += ` in ${duration}ms`;
    }
    
    writeLog(LogLevel.SQL, LogCategory.DATABASE, message, {
      query,
      params
    });
  },
  
  /**
   * Express middleware for logging HTTP requests
   * @param req Express request object
   * @param res Express response object
   * @param next Next middleware function
   */
  requestLogger: (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    
    // Log request
    logger.info(LogCategory.REQUEST, `${req.method} ${req.url}`, {
      headers: req.headers,
      query: req.query,
      body: req.method !== 'GET' ? req.body : undefined,
      ip: req.ip
    });
    
    // Capture response
    const originalSend = res.send;
    res.send = function(body) {
      const duration = Date.now() - startTime;
      
      // Log response
      logger.info(LogCategory.RESPONSE, `${res.statusCode} ${req.method} ${req.url} - ${duration}ms`, {
        headers: res.getHeaders(),
        body: body && typeof body === 'object' ? body : undefined
      });
      
      return originalSend.call(this, body);
    };
    
    next();
  }
};

export default logger;