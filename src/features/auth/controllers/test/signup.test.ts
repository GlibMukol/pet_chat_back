/* eslint-disable @typescript-eslint/no-empty-function */
import { describe, jest, it, expect } from '@jest/globals';
import { NextFunction, Request, Response } from 'express';
import * as cloudinaryUploads from '@global/helpers/cloudinary-upload';
import { authMock, authMockRequest, authMockResponse } from '@mock/auth.mock';
import { SignUp } from '../signup';
import {
  BadRequestError,
  JoiRequestValidationError,
} from '@global/helpers/error-handler';
import { authService } from '@service/db/auth.service';

jest.mock('@service/queues/base.queue');
jest.mock('@service/redis/base.cache');
jest.mock('@service/queues/user.queue');
jest.mock('@service/queues/auth.queue');
jest.mock('@global/helpers/cloudinary-upload');

describe('SignUp', () => {
  it('should throw an error if username is not availible', async () => {
    const req: Request = authMockRequest(
      {},
      {
        username: '',
        email: 'gray@test.com',
        password: 'qwerty',
        avatarColor: 'red',
        avatarImage: 'data:text/plain:base64,KAJHFBGIEFasdawdwa==',
      },
    ) as Request;
    const res: Response = authMockResponse();

    const next = jest.fn();
    await SignUp.prototype.create(req, res, next);

    const error = new JoiRequestValidationError('Username is a required field');

    expect(next).toHaveBeenCalledWith(error);

  });

  it('should throw error if username to short', async () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'qwe',
        email: 'gray@test.com',
        password: 'qwerty',
        avatarColor: 'red',
        avatarImage: 'data:text/plain:base64,KAJHFBGIEFasdawdwa==',
      },
    ) as Request;

    const res: Response = authMockResponse();

    const next = jest.fn();
    await SignUp.prototype.create(req, res, next);

    const error = new JoiRequestValidationError('Invalid username');
    expect(next).toHaveBeenCalledWith(error);

  });

  it('should throw error if username to long', async () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'qweawdadawdawd',
        email: 'gray@test.com',
        password: 'qwerty',
        avatarColor: 'red',
        avatarImage: 'data:text/plain:base64,KAJHFBGIEFasdawdwa==',
      },
    ) as Request;

    const res: Response = authMockResponse();

    const next = jest.fn();
    await SignUp.prototype.create(req, res, next);
    const error = new JoiRequestValidationError('Invalid username');

    expect(next).toHaveBeenCalledWith(error);
  });

  it('should throw error if  username not a string', async () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 234,
        email: 'gray@test.com',
        password: 'qwerty',
        avatarColor: 'red',
        avatarImage: 'data:text/plain:base64,KAJHFBGIEFasdawdwa==',
      },
    ) as Request;

    const res: Response = authMockResponse();

    const next = jest.fn();
    await SignUp.prototype.create(req, res, next);
    const error = new JoiRequestValidationError('Username must be of type string');
    expect(next).toHaveBeenCalledWith(error);

  });

  it('should throw error if pwd not a string', async () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'graywave',
        email: 'gray@test.com',
        password: null,
        avatarColor: 'red',
        avatarImage: 'data:text/plain:base64,KAJHFBGIEFasdawdwa==',
      },
    ) as Request;

    const res: Response = authMockResponse();

    const next = jest.fn();
    await SignUp.prototype.create(req, res, next);
    const error = new JoiRequestValidationError('Password must be of type string');

    expect(next).toHaveBeenCalledWith(error);

  });

  it('should throw error if pwd to short', async () => {
    const req: Request = authMockRequest({}, {
      username: 'graywave',
      email: 'gray@test.com',
      password: 'nul',
      avatarColor: 'red',
      avatarImage: 'data:text/plain:base64,KAJHFBGIEFasdawdwa=='
    }) as Request;

    const res: Response = authMockResponse();

    const next = jest.fn();
    await SignUp.prototype.create(req, res, next);
    const error = new JoiRequestValidationError('Invalid password');

    expect(next).toHaveBeenCalledWith(error);
  });

  it('should throw error if pwd to long', async () => {
    const req: Request = authMockRequest({}, {
      username: 'graywave',
      email: 'gray@test.com',
      password: 'nul',
      avatarColor: 'red',
      avatarImage: 'data:text/plain:base64,KAJHFBGIEFasdawdwa=='
    }) as Request;

    const res: Response = authMockResponse();

    const next = jest.fn();
    await SignUp.prototype.create(req, res, next);
    const error = new JoiRequestValidationError('Invalid password');

    expect(next).toHaveBeenCalledWith(error);
  });

  it('should throw error if pwd not exist', async () => {
    const req: Request = authMockRequest({}, {
      username: 'graywave',
      email: 'gray@test.com',
      avatarColor: 'red',
      avatarImage: 'data:text/plain:base64,KAJHFBGIEFasdawdwa=='
    }) as Request;

    const res: Response = authMockResponse();

    const next = jest.fn();
    await SignUp.prototype.create(req, res, next);
    const error = new JoiRequestValidationError('"password" is required');

    expect(next).toHaveBeenCalledWith(error);
  });

  it('should throw error if pwd empty', async () => {
    const req: Request = authMockRequest({}, {
      username: 'graywave',
      email: 'gray@test.com',
      password: '',
      avatarColor: 'red',
      avatarImage: 'data:text/plain:base64,KAJHFBGIEFasdawdwa=='
    }) as Request;

    const res: Response = authMockResponse();


    const next = jest.fn();
    await SignUp.prototype.create(req, res, next);
    const error = new JoiRequestValidationError('Password is a required field');

    expect(next).toHaveBeenCalledWith(error);
  });

  it('should throw error if email not string', async () => {
    const req: Request = authMockRequest({}, {
      username: 'graywave',
      email: null,
      password: 'awdawdaw',
      avatarColor: 'red',
      avatarImage: 'data:text/plain:base64,KAJHFBGIEFasdawdwa=='
    }) as Request;

    const res: Response = authMockResponse();

    const next = jest.fn();
    await SignUp.prototype.create(req, res, next);
    const error = new JoiRequestValidationError('Email must be of type string');

    expect(next).toHaveBeenCalledWith(error);
  });

  it('should throw error if email not valid', async () => {
    const req: Request = authMockRequest({}, {
      username: 'graywave',
      email: 'asdawawda',
      password: 'awdawdaw',
      avatarColor: 'red',
      avatarImage: 'data:text/plain:base64,KAJHFBGIEFasdawdwa=='
    }) as Request;

    const res: Response = authMockResponse();

    const next = jest.fn();
    await SignUp.prototype.create(req, res, next);
    const error = new JoiRequestValidationError('Email must be valid');

    expect(next).toHaveBeenCalledWith(error);
  });

  it('should throw error if email is empty', async () => {
    const req: Request = authMockRequest({}, {
      username: 'graywave',
      email: '',
      password: 'awdawda',
      avatarColor: 'red',
      avatarImage: 'data:text/plain:base64,KAJHFBGIEFasdawdwa=='
    }) as Request;

    const res: Response = authMockResponse();

    const next = jest.fn();
    await SignUp.prototype.create(req, res, next);
    const error = new JoiRequestValidationError('Email is a required field');

    expect(next).toHaveBeenCalledWith(error);

  });

  it('should throw error if email is empty', async () => {
    const req: Request = authMockRequest({}, {
      username: 'graywave',
      email: '',
      password: 'adwawa',
      avatarColor: 'red',
      avatarImage: 'data:text/plain:base64,KAJHFBGIEFasdawdwa=='
    }) as Request;

    const res: Response = authMockResponse();

    const next = jest.fn();
    await SignUp.prototype.create(req, res, next);
    const error = new JoiRequestValidationError('Email is a required field');

    expect(next).toHaveBeenCalledWith(error);
  });

  it('should throw error if avatar color empty', async () => {
    const req: Request = authMockRequest({}, {
      username: 'graywave',
      email: 'gray@mail.com',
      password: 'adwawa',
      avatarImage: 'data:text/plain:base64,KAJHFBGIEFasdawdwa=='
    }) as Request;

    const res: Response = authMockResponse();

    const next = jest.fn();
    await SignUp.prototype.create(req, res, next);
    const error = new JoiRequestValidationError('Avatar color is required');

    expect(next).toHaveBeenCalledWith(error);
  });

  it('should throw error if avatar image empty', async () => {
    const req: Request = authMockRequest({}, {
      username: 'graywave',
      email: 'gray@mail.com',
      password: 'adwawa',
      avatarColor: 'red',
    }) as Request;

    const res: Response = authMockResponse();

    const next = jest.fn();
    await SignUp.prototype.create(req, res, next);
    const error = new JoiRequestValidationError('Avatar image is required');

    expect(next).toHaveBeenCalledWith(error);

  });

  it('should throw unauthorize error, if user exist', async () => {
    const req: Request = authMockRequest({}, {
      username: 'graywave',
      email: 'gray@mail.com',
      password: 'adwawa',
      avatarColor: 'red',
      avatarImage: 'data:text/plain:base64,KAJHFBGIEFasdawdwa=='
    }) as Request;
    const fn = jest.spyOn(authService, 'getAuthUserByUsername');
    fn.mockResolvedValue(authMock);


    const res: Response = authMockResponse();

    const next = jest.fn();
    await SignUp.prototype.create(req, res, next);

    const error = new BadRequestError('Invalid credentials, user exist');
    expect(next).toHaveBeenCalledWith(error);

  });
  it('should set session for valid credentials and send correct json response',  () => {

  });
});
