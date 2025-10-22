import {
  AppError,
  ValidationError,
  NotFoundError,
  AuthenticationError,
  AuthorizationError,
  ExternalServiceError,
} from '../api/errors/AppError.js';

describe('AppError hierarchy', () => {
  it('sets default properties for AppError', () => {
    const error = new AppError('Something failed');

    expect(error.statusCode).toBe(500);
    expect(error.code).toBe('INTERNAL_SERVER_ERROR');
    expect(error.status).toBe('error');
    expect(error.isOperational).toBe(true);
  });

  it('creates specialized error variants with expected codes', () => {
    const validation = new ValidationError('Invalid');
    const notFound = new NotFoundError('Missing');
    const auth = new AuthenticationError('Auth');
    const authorization = new AuthorizationError('Forbidden');
    const external = new ExternalServiceError('External');

    expect(validation).toMatchObject({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      status: 'fail',
    });
    expect(notFound).toMatchObject({ statusCode: 404, code: 'NOT_FOUND' });
    expect(auth).toMatchObject({ statusCode: 401, code: 'AUTHENTICATION_ERROR' });
    expect(authorization).toMatchObject({
      statusCode: 403,
      code: 'AUTHORIZATION_ERROR',
    });
    expect(external).toMatchObject({
      statusCode: 502,
      code: 'EXTERNAL_SERVICE_ERROR',
    });
  });
});
