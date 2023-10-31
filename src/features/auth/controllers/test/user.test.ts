import {
  jest,
  it,
  describe,
  expect,
  beforeEach,
  afterEach,
} from '@jest/globals';
import { CurrentUser } from '../currents-user';
import { Request, Response } from 'express';
import { authMockRequest, authMockResponse } from '@mock/auth.mock';
import { UserCache } from '@service/redis/user.cache';
import { userService } from '@service/db/user.service';
import { existingUser } from '@mock/user.mock';

const USERNAME = 'graywave';
const PASSWORD = 'gray@mail.com';

jest.mock('@service/redis/user.cache');
jest.mock('@service/db/user.service');

describe('CurrentUser', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should get user from db if not exist in cache', async () => {
    const req: Request = authMockRequest({
      jwt: 'valid_token'
    }, {
      username: USERNAME,
      password: PASSWORD
    }) as Request;
    const res: Response = authMockResponse();

    jest.spyOn(UserCache.prototype, 'getUserFromCache').mockReturnValue(null as any);
    jest.spyOn(userService, 'getUserById').mockImplementation(() => Promise.resolve(existingUser));
    await CurrentUser.prototype.read(req, res);
    expect(res.json).toHaveBeenCalledWith({
      isUser: true,
      token: 'valid_token',
      user: existingUser
    });
  });

  it('should return user if exist in cache', async () => {
    const req: Request = authMockRequest({
      jwt: 'valid_token'
    }, {
      username: USERNAME,
      password: PASSWORD
    }) as Request;
    const res: Response = authMockResponse();

    jest.spyOn(UserCache.prototype, 'getUserFromCache').mockResolvedValue(existingUser);
    await CurrentUser.prototype.read(req, res);

  });

});
