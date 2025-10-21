import { ValidationError } from "../errors/AppError";

/**
 * Validates that required environment variables are set
 * @throws {ValidationError} If required environment variables are missing
 */
export const validateEnvVariables = () => {
  const required = ["TODOIST_TOKEN", "OPENAI_KEY"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new ValidationError(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
};

/**
 * Validates authentication hash from request
 * @param {string} hash - Hash from request query or params
 * @throws {ValidationError} If hash is invalid
 */
export const validateAuthHash = (hash) => {
  if (!hash || typeof hash !== "string" || hash.trim() === "") {
    throw new ValidationError("Hash parameter is required and must be a non-empty string");
  }

  if (hash.length < 8) {
    throw new ValidationError("Hash must be at least 8 characters long");
  }
};

/**
 * Validates cron job bearer token
 * @param {string} token - Bearer token from Authorization header
 * @throws {ValidationError} If token is invalid
 */
export const validateBearerToken = (token) => {
  if (!token || typeof token !== "string" || token.trim() === "") {
    throw new ValidationError("Bearer token is required and must be a non-empty string");
  }

  if (!token.startsWith("Bearer ")) {
    throw new ValidationError("Invalid Authorization header format. Expected 'Bearer <token>'");
  }
};

/**
 * Validates pagination parameters
 * @param {Object} params - Request query parameters
 * @param {number} params.limit - Maximum number of results
 * @param {number} params.offset - Number of results to skip
 * @returns {Object} Validated pagination parameters
 */
export const validatePagination = (params = {}) => {
  const limit = params.limit ? parseInt(params.limit, 10) : 50;
  const offset = params.offset ? parseInt(params.offset, 10) : 0;

  if (isNaN(limit) || limit < 1 || limit > 100) {
    throw new ValidationError("Limit must be a number between 1 and 100");
  }

  if (isNaN(offset) || offset < 0) {
    throw new ValidationError("Offset must be a non-negative number");
  }

  return { limit, offset };
};

/**
 * Validates task priority
 * @param {number} priority - Task priority (1-4)
 * @throws {ValidationError} If priority is invalid
 */
export const validatePriority = (priority) => {
  const priorityNum = parseInt(priority, 10);

  if (isNaN(priorityNum) || priorityNum < 1 || priorityNum > 4) {
    throw new ValidationError("Priority must be a number between 1 and 4");
  }

  return priorityNum;
};

/**
 * Validates project ID format
 * @param {string} projectId - Todoist project ID
 * @throws {ValidationError} If project ID is invalid
 */
export const validateProjectId = (projectId) => {
  if (!projectId || typeof projectId !== "string") {
    throw new ValidationError("Project ID must be a non-empty string");
  }

  // Todoist project IDs are numeric strings
  if (!/^\d+$/.test(projectId)) {
    throw new ValidationError("Project ID must contain only digits");
  }

  return projectId;
};

/**
 * Sanitizes string input to prevent injection attacks
 * @param {string} input - User input string
 * @param {number} maxLength - Maximum allowed length
 * @returns {string} Sanitized string
 */
export const sanitizeString = (input, maxLength = 500) => {
  if (typeof input !== "string") {
    return "";
  }

  // Trim and limit length
  let sanitized = input.trim().slice(0, maxLength);

  // Remove potentially dangerous characters
  sanitized = sanitized.replace(/[<>]/g, "");

  return sanitized;
};

/**
 * Validates request body structure
 * @param {Object} body - Request body
 * @param {Array<string>} requiredFields - Required field names
 * @throws {ValidationError} If required fields are missing
 */
export const validateRequiredFields = (body, requiredFields) => {
  if (!body || typeof body !== "object") {
    throw new ValidationError("Request body must be a valid JSON object");
  }

  const missing = requiredFields.filter((field) => !(field in body));

  if (missing.length > 0) {
    throw new ValidationError(
      `Missing required fields: ${missing.join(", ")}`
    );
  }
};
