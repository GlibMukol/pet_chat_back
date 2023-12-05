import { postWorker } from './../../workers/post.worker';
import { IPostJobData } from '@post/interfaces/post.interface';
import { BaseQueue } from './base.queue';

class PostQueue extends BaseQueue {
  constructor() {
    super('posts');
    this.proccessJob('addPostToDb', 5, postWorker.addPostToDb);
  }

  public addPostJob(name: string, data: IPostJobData) {
    this.addJob(name, data);
  }
}

export const postQueue: PostQueue = new PostQueue();
