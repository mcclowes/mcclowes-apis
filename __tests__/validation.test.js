import {
  validateEnvVariables,
  validateAuthHash,
  validateBearerToken,
  validatePagination,
  validatePriority,
  validateProjectId,
  sanitizeString,
  validateRequiredFields,
} from '../api/middleware/validation.js';
import { ValidationError } from '../api/errors/AppError.js';

describe('validateEnvVariables', () => {
  const originalToken = process.env.TODOIST_TOKEN;
  const originalKey = process.env.OPENAI_KEY;

  afterEach(() => {
    if (originalToken === undefined) {
      delete process.env.TODOIST_TOKEN;
    } else {
      process.env.TODOIST_TOKEN = originalToken;
    }

    if (originalKey === undefined) {
      delete process.env.OPENAI_KEY;
    } else {
      process.env.OPENAI_KEY = originalKey;
    }
  });

  it('throws when required environment variables are missing', () => {
    delete process.env.TODOIST_TOKEN;
    delete process.env.OPENAI_KEY;

    expect(() => validateEnvVariables()).toThrow(ValidationError);
  });

  it('passes when required environment variables are present', () => {
    process.env.TODOIST_TOKEN = 'token';
    process.env.OPENAI_KEY = 'key';

    expect(() => validateEnvVariables()).not.toThrow();
  });
});

describe('validateAuthHash', () => {
  it('throws for invalid hash values', () => {
    expect(() => validateAuthHash('')).toThrow(ValidationError);
    expect(() => validateAuthHash('short')).toThrow(ValidationError);
  });

  it('does not throw for valid hash', () => {
    expect(() => validateAuthHash('abcdefgh')).not.toThrow();
  });
});

describe('validateBearerToken', () => {
  it('throws when token missing or not a string', () => {
    expect(() => validateBearerToken('')).toThrow(ValidationError);
    expect(() => validateBearerToken(null)).toThrow(ValidationError);
  });

  it("throws when token does not include 'Bearer' prefix", () => {
    expect(() => validateBearerToken('token')).toThrow(ValidationError);
  });

  it('passes for valid bearer token', () => {
    expect(() => validateBearerToken('Bearer token')).not.toThrow();
  });
});

describe('validatePagination', () => {
  it('returns defaults when parameters are missing', () => {
    expect(validatePagination()).toEqual({ limit: 50, offset: 0 });
  });

  it('throws when limit is out of range', () => {
    expect(() => validatePagination({ limit: 0 })).toThrow(ValidationError);
    expect(() => validatePagination({ limit: 101 })).toThrow(ValidationError);
  });

  it('throws when offset is negative', () => {
    expect(() => validatePagination({ offset: -1 })).toThrow(ValidationError);
  });

  it('parses valid parameters correctly', () => {
    expect(validatePagination({ limit: '20', offset: '5' })).toEqual({
      limit: 20,
      offset: 5,
    });
  });
});

describe('validatePriority', () => {
  it('throws when priority is outside valid range', () => {
    expect(() => validatePriority(0)).toThrow(ValidationError);
    expect(() => validatePriority(5)).toThrow(ValidationError);
  });

  it('returns parsed priority for valid values', () => {
    expect(validatePriority('4')).toBe(4);
  });
});

describe('validateProjectId', () => {
  it('throws when project id is invalid', () => {
    expect(() => validateProjectId('')).toThrow(ValidationError);
    expect(() => validateProjectId('abc123')).toThrow(ValidationError);
  });

  it('returns project id when valid', () => {
    expect(validateProjectId('12345')).toBe('12345');
  });
});

describe('sanitizeString', () => {
  it('returns empty string for non-string input', () => {
    expect(sanitizeString(null)).toBe('');
  });

  it('trims, limits length, and removes dangerous characters', () => {
    const result = sanitizeString('   <script>alert(1)</script>   ', 10);
    expect(result).toBe('scriptal');
  });
});

describe('validateRequiredFields', () => {
  it('throws when body is not an object', () => {
    expect(() => validateRequiredFields(null, ['id'])).toThrow(ValidationError);
  });

  it('throws when required fields are missing', () => {
    expect(() => validateRequiredFields({ id: 1 }, ['id', 'name'])).toThrow(
      ValidationError,
    );
  });

  it('passes when all required fields are present', () => {
    expect(() => validateRequiredFields({ id: 1, name: 'Task' }, ['id', 'name'])).not.toThrow();
  });
});
