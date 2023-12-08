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

// describe('Create', () => {
//   beforeEach(() => {
//     jest.restoreAllMocks();
//   });

//   afterEach(() => {
//     jest.clearAllMocks();
//     jest.clearAllTimers();
//   });

//   describe('post', () => {
//     it('should send correct json response', async () => {
//       const req: Request = postMockRequest(newPost, authUserPayload) as Request;
//       const res: Response = postMockResponse();
//       jest.spyOn(postServer.socketIOPostObject, 'emit');
//       const spy = jest.spyOn(PostCache.prototype, 'savePostToCache');
//       jest.spyOn(postQueue, 'addPostJob');

//       await Create.prototype.post(req, res);
//       const createdPost = spy.mock.calls[0][0].createdPost;
//       expect(postServer.socketIOPostObject.emit).toHaveBeenCalledWith('add post', createdPost);
//       expect(PostCache.prototype.savePostToCache).toHaveBeenCalledWith({
//         key: spy.mock.calls[0][0].key,
//         currentUserId: `${req.currentUser?.userId}`,
//         uId: `${req.currentUser?.uId}`,
//         createdPost
//       });
//       expect(postQueue.addPostJob).toHaveBeenCalledWith('addPostToDB', { key: req.currentUser?.userId, value: createdPost });
//       expect(res.status).toHaveBeenCalledWith(201);
//       expect(res.json).toHaveBeenCalledWith({
//         message: 'Post created successfully'
//       });
//     });
//   });

//   describe('postWithImage', () => {
//     it('should throw an error if image is not available', () => {
//       delete newPost.image;
//       const req: Request = postMockRequest(newPost, authUserPayload) as Request;
//       const res: Response = postMockResponse();

//       Create.prototype.postWithImage(req, res).catch((error: CustomError) => {
//         expect(error.statusCode).toEqual(400);
//         expect(error.serializeErrors().message).toEqual('Image is a required field');
//       });
//     });

//     it('should throw an upload error', () => {
//       newPost.image = 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==';
//       const req: Request = postMockRequest(newPost, authUserPayload) as Request;
//       const res: Response = postMockResponse();
//       jest
//         .spyOn(cloudinaryUploads, 'uploads')
//         .mockImplementation((): any => Promise.resolve({ version: '', public_id: '', message: 'Upload error' }));

//       Create.prototype.postWithImage(req, res).catch((error: CustomError) => {
//         expect(error.statusCode).toEqual(400);
//         expect(error.serializeErrors().message).toEqual('Upload error');
//       });
//     });

//     it('should send correct json response', async () => {
//       newPost.image = 'testing image';
//       const req: Request = postMockRequest(newPost, authUserPayload) as Request;
//       const res: Response = postMockResponse();
//       jest.spyOn(postServer.socketIOPostObject, 'emit');
//       const spy = jest.spyOn(PostCache.prototype, 'savePostToCache');
//       jest.spyOn(postQueue, 'addPostJob');
//       jest.spyOn(cloudinaryUploads, 'uploads').mockImplementation((): any => Promise.resolve({ version: '1234', public_id: '123456' }));

//       await Create.prototype.postWithImage(req, res);
//       const createdPost = spy.mock.calls[0][0].createdPost;
//       expect(postServer.socketIOPostObject.emit).toHaveBeenCalledWith('add post', createdPost);
//       expect(PostCache.prototype.savePostToCache).toHaveBeenCalledWith({
//         key: spy.mock.calls[0][0].key,
//         currentUserId: `${req.currentUser?.userId}`,
//         uId: `${req.currentUser?.uId}`,
//         createdPost
//       });
//       expect(postQueue.addPostJob).toHaveBeenCalledWith('addPostToDB', { key: req.currentUser?.userId, value: createdPost });
//       expect(res.status).toHaveBeenCalledWith(201);
//       expect(res.json).toHaveBeenCalledWith({
//         message: 'Post created with image successfully'
//       });
//     });
//   });
// });
