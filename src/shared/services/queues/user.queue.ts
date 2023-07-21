import { BaseQueue } from './base.queue';
import { userWorker } from '@root/shared/workers/user.worker';

class UserQueue extends BaseQueue {
  constructor() {
    super('auth');
    // this.proccessJob('addUserToDb', 5, userWorker.addUserToDB);
  }

  public addUserJob(name: string, data: any): void {
    this.addJob(name, data);
  }
}


export const userQueue: UserQueue = new UserQueue();
