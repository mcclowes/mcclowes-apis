import { validateHash, validateCronJob } from '../_lib/auth.js';
import { AuthenticationError } from '../api/errors/AppError.js';

describe('validateHash', () => {
  const originalEnv = process.env.HASH;

  beforeEach(() => {
    process.env.HASH = 'secret-hash';
  });

  afterAll(() => {
    process.env.HASH = originalEnv;
  });

  it('throws AuthenticationError when hash is missing', () => {
    expect(() => validateHash({ query: {} })).toThrow(AuthenticationError);
  });

  it('throws AuthenticationError when hash is incorrect', () => {
    expect(() => validateHash({ query: { hash: 'wrong' } })).toThrow(
      AuthenticationError,
    );
  });

  it('does not throw when hash matches expected value', () => {
    expect(() => validateHash({ query: { hash: 'secret-hash' } })).not.toThrow();
  });
});

describe('validateCronJob', () => {
  const originalEnv = process.env.CRON_SECRET;

  beforeEach(() => {
    process.env.CRON_SECRET = 'cron-secret';
  });

  afterAll(() => {
    process.env.CRON_SECRET = originalEnv;
  });

  it('throws AuthenticationError when authorization header is missing', () => {
    expect(() => validateCronJob({ headers: {} })).toThrow(AuthenticationError);
  });

  it('throws AuthenticationError when authorization header is incorrect', () => {
    expect(() =>
      validateCronJob({ headers: { authorization: 'Bearer wrong' } }),
    ).toThrow(AuthenticationError);
  });

  it('does not throw when bearer token matches expected value', () => {
    expect(() =>
      validateCronJob({ headers: { authorization: 'Bearer cron-secret' } }),
    ).not.toThrow();
  });
});
