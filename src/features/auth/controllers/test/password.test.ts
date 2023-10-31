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
import { Password } from '../password';
import { BadRequestError, JoiRequestValidationError } from '@global/helpers/error-handler';
import { authService } from '@service/db/auth.service';
import { AuthPayload } from '@auth/interfaces/auth.interface';

jest.mock('@service/db/auth.service');
jest.mock('@service/queues/email.queue');
jest.mock('@service/queues/base.queue');
jest.mock('@sendgrid/mail');

enum PASSWORD {
  WRONGE_EMAIL = 'wrong@email.com',
  INVALID_EMAIL = 'invalid',
  CORRECT_EMAIL = 'gray@mail.com',
  WRONG_PWD = 'wrong_pwd',
  CORRECT_PWD = 'qwerty'
};

describe('Password', () =>  {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });


  describe('create', () => {
    it('should pass error to the next function, if invalid email', async () => {
      const  req: Request = authMockRequest({}, {email: PASSWORD.INVALID_EMAIL}) as Request;
      const res: Response = authMockResponse();
      const next = jest.fn();

      const error = new JoiRequestValidationError('Field must be valid');

      await Password.prototype.create(req, res, next);
      expect(next).toHaveBeenCalledWith(error);

    });

    it('should pass error to the next function, if email not exist', async () => {
      const  req: Request = authMockRequest({}, {email: null}) as Request;
      const res: Response = authMockResponse();
      const next = jest.fn();

      const error = new JoiRequestValidationError('Field must be valid');

      await Password.prototype.create(req, res, next);
      expect(next).toHaveBeenCalledWith(error);

    });

    it('should pass error to the next function, user not exist', async () => {
      const  req: Request = authMockRequest({}, {email: PASSWORD.CORRECT_EMAIL}) as Request;
      const res: Response = authMockResponse();
      const next = jest.fn();

      jest.spyOn(authService, 'getAuthUserByEmail').mockImplementation(() => Promise.resolve(null) as any);

      const error = new BadRequestError('Invalid credentials');

      await Password.prototype.create(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });

    it('should send email, and message if all ok', async () => {
      const req: Request = authMockRequest({} , {email: PASSWORD.CORRECT_EMAIL}) as Request;
      const res: Response = authMockResponse();
      const next = jest.fn();
      jest.spyOn(authService, 'getAuthUserByEmail').mockResolvedValue(authMock);
      await Password.prototype.create(req, res, next);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Password reset email send.'
      });
    });
  });

  describe('update', () => {
    it('should pass error to the next function if password not a string', async () => {
      const req: Request = authMockRequest({}, {password : null}) as Request;
      const res: Response = authMockResponse();
      const next = jest.fn();

      const error = new JoiRequestValidationError('Password should be of type string');
      await Password.prototype.update(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });

    it('should pass error to next function if password to short', async () => {
      const req: Request = authMockRequest({}, {password: 'asd'}) as Request;
      const res: Response = authMockResponse();
      const next = jest.fn();

      const error = new JoiRequestValidationError('Invalid password');

      await Password.prototype.update(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });

    it('should pass error to next function if password to long', async () => {
      const req: Request = authMockRequest({}, {password: 'asdasdasdawawdaw'}) as Request;
      const res: Response = authMockResponse();
      const next = jest.fn();

      const error = new JoiRequestValidationError('Invalid password');

      await Password.prototype.update(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });

    it('should pass error to next function if password is empty string', async () => {
      const req: Request = authMockRequest({}, {password: ''}) as Request;
      const res: Response = authMockResponse();
      const next = jest.fn();

      const error = new JoiRequestValidationError('Password is a required field');

      await Password.prototype.update(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });

    it('should pass error to next function if password !== confirmPassword', async () => {
      const req: Request = authMockRequest({}, {
        password: PASSWORD.CORRECT_PWD,
        confirmPassword: PASSWORD.WRONG_PWD
      }) as Request;
      const res = authMockResponse();
      const next = jest.fn();

      const error = new BadRequestError('Passwords should match');

      await Password.prototype.update(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });

    it('shoul pass error to the next function if token expire', async () => {
      const req: Request = authMockRequest({}, {
        password: PASSWORD.CORRECT_PWD,
        confirmPassword: PASSWORD.CORRECT_PWD
      }, {} as AuthPayload, {
        token: 'expire_token'
      }) as Request;
      const res: Response = authMockResponse();
      const next = jest.fn();

      const error = new BadRequestError('Reset token has expired.');

      jest.spyOn(authService, 'getAuthUserByPwdToken').mockResolvedValue(null as any);

      await Password.prototype.update(req, res, next);
      expect(next).toHaveBeenLastCalledWith(error);
    });

    it('shoul send response if all ok', async() => {
      const req: Request = authMockRequest({}, {
        password: PASSWORD.CORRECT_PWD,
        confirmPassword: PASSWORD.CORRECT_PWD
      }, {}  as AuthPayload, {
        token: 'valid_token'
      }) as Request;

      const res: Response = authMockResponse();
      const next = jest.fn();

      jest.spyOn(authService, 'getAuthUserByPwdToken').mockResolvedValue(authMock);
      await Password.prototype.update(req, res, next);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Password successfully updated'
      });
    });

  });
});
