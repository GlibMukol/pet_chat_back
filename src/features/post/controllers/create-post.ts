import { ObjectId } from 'mongodb';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { postSchema, postWithImageSchema } from '@post/shemes/post.schema';
import { Request, Response, NextFunction } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { IPostDocument } from '@post/interfaces/post.interface';
import { PostCache } from '@service/redis/post.cache';
import { socketIOPostObject } from '@socket/post.socket';
import { postQueue } from '@service/queues/post.queue';
import { uploads } from '@global/helpers/cloudinary-upload';
import { BadRequestError } from '@global/helpers/error-handler';
import { UploadApiResponse } from 'cloudinary';

const postCache: PostCache = new PostCache();

export class Create {
  @joiValidation(postSchema)
  public async post(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const { post, bgColor, privacy, feelings, gifUrl, profilePicture } =
      req.body;

    const postObjectId = new ObjectId();
    const createdPost: IPostDocument = {
      _id: postObjectId,
      userId: req.currentUser!.userId,
      username: req.currentUser!.username,
      email: req.currentUser!.email,
      avatarColor: req.currentUser!.avatarColor,
      profilePicture,
      post,
      bgColor,
      feelings,
      privacy,
      gifUrl,
      commentsCount: 0,
      imgVersion: '',
      imgId: '',
      createdAt: new Date(),
      reactions: {
        like: 0,
        love: 0,
        haha: 0,
        wow: 0,
        angry: 0,
        sad: 0,
      },
    } as IPostDocument;

    socketIOPostObject.emit('add post', createdPost);

    await postCache.savePostToCache({
      key: postObjectId,
      currentUserId: `${req.currentUser!.userId}`,
      uId: `${req.currentUser!.uId}`,
      createdPost,
    });

    postQueue.addPostJob('addPostToDb', {
      key: req.currentUser!.userId,
      value: createdPost,
    });

    res
      .status(HTTP_STATUS.CREATED)
      .json({ message: 'Post created successfully' });
  }

  @joiValidation(postWithImageSchema)
  public async postWithImage(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const { post, bgColor, privacy, feelings, gifUrl, profilePicture, image } =
      req.body;

    const result: UploadApiResponse = (await uploads(
      image,
    )) as UploadApiResponse;

    if (!result?.public_id) {
      return next(new BadRequestError(result.message));
    }

    const postObjectId = new ObjectId();
    const createdPost: IPostDocument = {
      _id: postObjectId,
      userId: req.currentUser!.userId,
      username: req.currentUser!.username,
      email: req.currentUser!.email,
      avatarColor: req.currentUser!.avatarColor,
      profilePicture,
      post,
      bgColor,
      feelings,
      privacy,
      gifUrl,
      commentsCount: 0,
      imgVersion: result.version.toString(),
      imgId: result.public_id,
      createdAt: new Date(),
      reactions: {
        like: 0,
        love: 0,
        haha: 0,
        wow: 0,
        angry: 0,
        sad: 0,
      },
    } as IPostDocument;

    socketIOPostObject.emit('add post', createdPost);

    await postCache.savePostToCache({
      key: postObjectId,
      currentUserId: `${req.currentUser!.userId}`,
      uId: `${req.currentUser!.uId}`,
      createdPost,
    });

    postQueue.addPostJob('addPostToDb', {
      key: req.currentUser!.userId,
      value: createdPost,
    });

    res
      .status(HTTP_STATUS.CREATED)
      .json({ message: 'Post created with image successfully' });
  }
}
