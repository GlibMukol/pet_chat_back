import express, {Express} from 'express';
import {ChatServer} from './setupServer';
import dbConnection from './setupDb';
import { config } from './config';

class Application {
    public initialize(): void {
        this.loadConfig();
        dbConnection();
        const app: Express = express();
        const server: ChatServer = new ChatServer(app);
        server.start();
    }

    private loadConfig() : void {
        config.validateConfig();
    }
}

const application: Application = new Application();
application.initialize();

