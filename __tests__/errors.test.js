import { handleError, withErrorHandling } from '../_lib/errors.js';
import { AppError } from '../api/errors/AppError.js';

describe('handleError', () => {
  let originalEnv;
  let res;
  let statusMock;
  let jsonMock;

  beforeEach(() => {
    originalEnv = process.env.NODE_ENV;
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    res = {
      status: statusMock,
    };
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    jest.restoreAllMocks();
  });

  it('returns detailed response in development mode', () => {
    process.env.NODE_ENV = 'development';
    const error = new AppError('fail', 400, 'VALIDATION_ERROR');

    handleError(error, res);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'fail',
        message: 'fail',
      }),
    );
  });

  it('returns operational error response in production mode', () => {
    process.env.NODE_ENV = 'production';
    const error = new AppError('not found', 404, 'NOT_FOUND');

    handleError(error, res);

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({
      status: 'fail',
      code: 'NOT_FOUND',
      message: 'not found',
    });
  });

  it('returns generic response for unexpected errors', () => {
    process.env.NODE_ENV = 'production';
    const error = new Error('boom');

    handleError(error, res);

    expect(console.error).toHaveBeenCalled();
    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      status: 'error',
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Something went wrong!',
    });
  });
});

describe('withErrorHandling', () => {
  let originalEnv;
  let res;
  let statusMock;
  let jsonMock;

  beforeEach(() => {
    originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    res = { status: statusMock };
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    jest.restoreAllMocks();
  });

  it('executes handler successfully when no error is thrown', async () => {
    const handler = jest.fn().mockResolvedValue(undefined);
    const wrapped = withErrorHandling(handler);

    await wrapped({}, res);

    expect(handler).toHaveBeenCalled();
    expect(statusMock).not.toHaveBeenCalled();
  });

  it('handles errors thrown by handler', async () => {
    const handler = jest.fn().mockRejectedValue(new Error('fail'));
    const wrapped = withErrorHandling(handler);

    await wrapped({}, res);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      status: 'error',
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Something went wrong!',
    });
  });
});
