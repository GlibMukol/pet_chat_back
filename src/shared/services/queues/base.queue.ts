import  Queue, {Job} from 'bull';
import Logger from 'bunyan';
import { createBullBoard } from '@bull-board/api';
import {BullAdapter} from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { config } from '@root/config';

let bullAdapters: BullAdapter[] = [];

export let serverAdapter: ExpressAdapter;

export abstract class BaseQueue {
  queue: Queue.Queue;
  log: Logger;

  constructor(queueName: string) {
    this.queue = new Queue(queueName, `${config.REDIS_HOST}`);
    bullAdapters.push(new BullAdapter(this.queue));
    bullAdapters= [...new Set(bullAdapters)];
    serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath('queuses');

    createBullBoard({
      queues: bullAdapters,
      serverAdapter
    });

    this.log = config.creatLogger(`${queueName}Queue`);

    this.queue.on('completed', (job: Job) => {
      job.remove();
    });

    this.queue.on('global:completed', (jobId: string) => {
       this.log.info(`Job ${jobId} complited`);
    });

    this.queue.on('global:stalled', (jobId: string) => {
       this.log.info(`Job ${jobId} stalled`);
    });
  }
}
