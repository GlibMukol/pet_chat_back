import { ObjectId } from 'mongodb';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { postSchema } from '@post/shemes/post.schema';
import { Request, Response, NextFunction} from 'express';
import HTTP_STATUS from 'http-status-codes';
import { IPostDocument } from '@post/interfaces/post.interface';
import { PostCache } from '@service/redis/post.cache';

const postCache: PostCache = new PostCache();

export class Create {
  @joiValidation(postSchema)
  public async post(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const {
      post,
      bgColor,
      privacy,
      feelings,
      gifUrl,
      profilePicture,
      imgVersion,
      imgId,
      image,
    } = req.body;

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
        sad: 0
       }
    } as IPostDocument;

    await postCache.savePostToCache({
      key: postObjectId,
      currentUserId:  `${req.currentUser!.userId}`,
      uId: `${req.currentUser!.uId}`,
      createdPost
    });

    res.status(HTTP_STATUS.CREATED).json({message: 'Post created successfully'});

  }
}
