import { BaseCache } from './base.cache';
import { config } from '@root/config';
import { ServerError } from '@global/helpers/error-handler';
import Logger from 'bunyan';
import { ISavePostToCache } from '@post/interfaces/post.interface';

const log: Logger = config.creatLogger('postCache');

export class PostCache extends BaseCache {
  constructor() {
    super('postCache');
  }

  public async savePostToCache(data: ISavePostToCache): Promise<void> {
    const { createdPost, currentUserId, key, uId } = data;

    const {
      _id,
      userId,
      username,
      email,
      avatarColor,
      profilePicture,
      post,
      bgColor,
      feelings,
      privacy,
      gifUrl,
      commentsCount,
      imgVersion,
      imgId,
      reactions,
      createdAt,
    } = createdPost;

    const firstList: string[] = [
      '_id',
      `${_id}`,
      'userId',
      `${userId}`,
      'username',
      `${username}`,
      'email',
      `${email}`,
      'avatarColor',
      `${avatarColor}`,
      'profilePicture',
      `${profilePicture}`,
      'post',
      `${post}`,
      'bgColor',
      `${bgColor}`,
      'feelings',
      `${feelings}`,
      'privacy',
      `${privacy}`,
      'gifUrl',
      `${gifUrl}`,
    ];

    const secondList: string[] = [
      'commentsCount',
      `${commentsCount}`,
      'imgVersion',
      `${imgVersion}`,
      'imgId',
      `${imgId}`,
      'reactions',
      JSON.stringify(reactions),
      'createdAt',
      `${createdAt}`,
    ];

    const dataToSave: string[] = [...firstList, ...secondList];

    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const postCount: string[] = await this.client.HMGET(
        `users:${currentUserId}`,
        'postsCount',
      );

      const multi = this.client.multi();

      multi.ZADD('post', {
        score: parseInt(uId, 10),
        value: `${key}`,
      });

      multi.HSET(`posts:${key}`, dataToSave);

      const count: number = parseInt(postCount[0], 10) + 1;
      multi.HSET(`users:${currentUserId}`, ['postCount', count]);

      multi.exec();
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error, try again');
    }
  }
}
