import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';
import { config } from '@root/config';
import { postService } from '@service/db/post.service';

const log: Logger = config.creatLogger('postWorker');

class PostWorker {
  async addPostToDb(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { value, key } = job.data;
      await postService.addPostToDb(key, value);
      job.progress(100);
      done(null, value);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
}

export const postWorker: PostWorker = new PostWorker();
