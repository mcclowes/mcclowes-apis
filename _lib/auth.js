import { AuthenticationError } from '../api/errors/AppError.js';

/**
 * Validates hash-based authentication from query parameters
 * @param {object} req - Request object
 * @throws {AuthenticationError} If hash is invalid or missing
 */
export const validateHash = (req) => {
  const hash = req.query.hash;
  if (!hash || hash !== process.env.HASH) {
    throw new AuthenticationError('Invalid or missing authentication hash');
  }
};

/**
 * Validates cron job authentication from Authorization header
 * @param {object} req - Request object
 * @throws {AuthenticationError} If cron secret is invalid or missing
 */
export const validateCronJob = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    throw new AuthenticationError('Invalid or missing cron job authentication');
  }
};
