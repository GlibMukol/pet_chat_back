import {
  jest,
  it,
  describe,
  expect,
  beforeEach,
  afterEach,
} from '@jest/globals';
import { SignOut } from '../signout';
import { Request, Response } from 'express';
import { authMockRequest, authMockResponse } from '@mock/auth.mock';

describe('SignOut', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should set request session to null after call', async () => {
    const req: Request = authMockRequest({}, {}) as Request;
    const res: Response = authMockResponse();

    await SignOut.prototype.update(req, res);
    expect(res.json).toHaveBeenLastCalledWith({
      message: 'Logout successfull',
      user: {},
      token: '',
    });
    expect(req.session).toBe(null);
  });
});
