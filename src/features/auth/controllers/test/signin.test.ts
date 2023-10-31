import {
  describe,
  jest,
  it,
  expect,
  beforeEach,
  afterEach,
} from '@jest/globals';
import { authMock, authMockRequest, authMockResponse } from '@mock/auth.mock';
import { Request, Response } from 'express';
import { SignIn } from '../sighin';
import { JoiRequestValidationError } from '@global/helpers/error-handler';
import { authService } from '@service/db/auth.service';
import { userService } from '@service/db/user.service';
import { mergedAuthAndUserData } from '@mock/user.mock';
import JWT from 'jsonwebtoken';

enum USER {
  USERNAME = 'graywave',
  PASSWORD = 'qwerty',
}

jest.mock('jsonwebtoken');

jest.useFakeTimers();
describe('SignIn', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });
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

  it('should throw an error if username is to long', async () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'asdasdasaa',
        password: USER.PASSWORD,
      },
    ) as Request;
    const res: Response = authMockResponse();
    const next = jest.fn();

    const error = new JoiRequestValidationError('Invalid username');

    await SignIn.prototype.read(req, res, next);
    expect(next).toHaveBeenCalledWith(error);
  });

  it('should throw an error if password is not available', async () => {
    const req: Request = authMockRequest(
      {},
      {
        username: USER.USERNAME,
        password: '',
      },
    ) as Request;

    const res: Response = authMockResponse();

    const next = jest.fn();

    const error = new JoiRequestValidationError('Password is a required field');

    await SignIn.prototype.read(req, res, next);
    expect(next).toHaveBeenCalledWith(error);
  });

  it('should throw error if pwd to short', async () => {
    const req: Request = authMockRequest(
      {},
      {
        username: USER.USERNAME,
        password: 'qwe',
      },
    ) as Request;

    const res: Response = authMockResponse();

    const next = jest.fn();

    const error = new JoiRequestValidationError('Invalid password');

    await SignIn.prototype.read(req, res, next);
    expect(next).toHaveBeenCalledWith(error);
  });

  it('should throw error if pwd to long', async () => {
    const req: Request = authMockRequest(
      {},
      {
        username: USER.USERNAME,
        password: 'qweqweqweqwe',
      },
    ) as Request;

    const res: Response = authMockResponse();

    const next = jest.fn();

    const error = new JoiRequestValidationError('Invalid password');

    await SignIn.prototype.read(req, res, next);
    expect(next).toHaveBeenCalledWith(error);
  });
  it('should throw error if pwd not a string', async () => {
    const req: Request = authMockRequest(
      {},
      {
        username: USER.USERNAME,
        password: null,
      },
    ) as Request;

    const res: Response = authMockResponse();

    const next = jest.fn();

    const error = new JoiRequestValidationError(
      'Password must be of type string',
    );

    await SignIn.prototype.read(req, res, next);
    expect(next).toHaveBeenCalledWith(error);
  });

  it('should set session data for valid credentials and send correct json response', async () => {
    const req = authMockRequest(
      {},
      {
        username: USER.USERNAME,
        password: USER.PASSWORD,
      },
    ) as Request;

    const res: Response = authMockResponse();

    const next = jest.fn();

    authMock.comparePassword = () => Promise.resolve(true);

    jest
      .spyOn(authService, 'getAuthUserByUsername')
      .mockResolvedValue(authMock);
    jest
      .spyOn(userService, 'getUserByAuthId')
      .mockResolvedValue(mergedAuthAndUserData);

    jest.spyOn(JWT, 'sign').mockImplementation(() => 'token');

    await SignIn.prototype.read(req, res, next);
    expect(req.session?.jwt).toBeDefined();
    expect(res.json).toHaveBeenCalledWith({
      message: 'User login successfully',
      user: mergedAuthAndUserData,
      token: req.session?.jwt,
    });
  });
});
