import express, { Express } from 'express';
import { ChatServer } from '@root/setupServer';
import dbConnection from '@root/setupDb';
import { config } from '@root/config';

class Application {
  public initialize(): void {
    this.loadConfig();
    dbConnection();
    const app: Express = express();
    const server: ChatServer = new ChatServer(app);
    server.start();
  }

  private loadConfig(): void {
    config.validateConfig();
    config.cloudinaryConfig();
  }
}

const application: Application = new Application();
application.initialize();
