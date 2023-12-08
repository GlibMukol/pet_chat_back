import {
  jest,
  describe,
  it,
  beforeEach,
  afterEach,
  expect,
  beforeAll,
} from '@jest/globals';
import { NextFunction, Request, Response } from 'express';
import { Server } from 'socket.io';
import { authUserPayload } from '@root/mocks/auth.mock';
import * as postServer from '@socket/post.socket';
import { newPost, postMockRequest } from '@root/mocks/post.mock';
import { postQueue } from '@service/queues/post.queue';
import { Create } from '@post/controllers/create-post';
import { PostCache } from '@service/redis/post.cache';

jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
jest.mock('@service/redis/post.cache');
jest.mock('@global/helpers/cloudinary-upload');
jest.mock('@socket/post.socket');

Object.defineProperties(postServer, {
  socketIOPostObject: {
    value: new Server(),
    writable: true,
  },
});

describe('Create post', () => {
  let req: Request;
  let res: Response;
  let next: NextFunction;

  beforeAll(() => {
    req = postMockRequest(newPost, authUserPayload) as Request;
    res = {
      status: jest.fn,
      json: jest.fn,
    } as unknown as Response;
    next = jest.fn();
  });

  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(res, 'status').mockReturnThis();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should emmit to socket server', async () => {
    jest.spyOn(postServer.socketIOPostObject, 'emit');
    await Create.prototype.post(req, res, next);
    expect(postServer.socketIOPostObject.emit).toHaveBeenCalled();
  });

  it('should save post to redis cache', async () => {
    const postCacheSpy = jest.spyOn(PostCache.prototype, 'savePostToCache');
    await Create.prototype.post(req, res, next);
    expect(PostCache.prototype.savePostToCache).toHaveBeenCalled();
    expect(PostCache.prototype.savePostToCache).toHaveBeenCalledWith({
      key: postCacheSpy.mock.calls[0][0].key,
      currentUserId: `${req.currentUser?.userId}`,
      uId: `${req.currentUser?.uId}`,
      createdPost: postCacheSpy.mock.calls[0][0].createdPost,
    });
  });

  it('should add post to queue', async () => {
    const spy = jest.spyOn(postQueue, 'addPostJob');

    await Create.prototype.post(req, res, next);

    expect(postQueue.addPostJob).toHaveBeenCalled();
    expect(postQueue.addPostJob).toHaveBeenCalledWith('addPostToDb', {
      ...spy.mock.calls[0][1],
    });
  });

  it('should return currect response', async () => {
    jest.spyOn(res, 'json');
    await Create.prototype.post(req, res, next);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Post created successfully',
    });
  });
});

