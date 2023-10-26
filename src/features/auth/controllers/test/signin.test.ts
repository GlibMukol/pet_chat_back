import { describe, jest, it, expect } from '@jest/globals';
import { authMockRequest, authMockResponse } from '@mock/auth.mock';
import { NextFunction, Request, Response } from 'express';
import { SignIn } from '../sighin';
import {
  BadRequestError,
  JoiRequestValidationError,
} from '@global/helpers/error-handler';
// import { BadRequestError } from '@global/helpers/error-handler';

enum USER {
  USERNAME = 'graywave',
  PASSWORD = 'qwerty',
}

describe('SignIn', () => {
  it('should throw an error if username is not available', async () => {
    const req: Request = authMockRequest(
      {},
      { username: '', password: USER.PASSWORD },
    ) as Request;
    const res: Response = authMockResponse();
    const next = jest.fn();

    const error = new JoiRequestValidationError('Username is a required field');
    await SignIn.prototype.read(req, res, next);
    expect(next).toHaveBeenCalledWith(error);
  });

  it('should throw error if username to short', async () => {
    const req: Request = authMockRequest(
      {},
      { username: 'sd', password: USER.PASSWORD },
    ) as Request;
    const res: Response = authMockResponse();
    const next = jest.fn();

    const error = new JoiRequestValidationError('Invalid username');

    await SignIn.prototype.read(req, res, next);
    expect(next).toHaveBeenCalledWith(error);
  });
});
