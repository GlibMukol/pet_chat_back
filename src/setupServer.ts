import {Application, json, urlencoded, Response, Request, NextFunction} from 'express';
import {Server as HttpServer} from 'http';
import cors from 'cors';
import helmet from 'helmet';
import cookieSession from 'cookie-session';
import HTTP_STATUS from 'http-status-codes';
import hpp from 'hpp';
import compression from 'compression';
import { Server as ServerIO } from 'socket.io';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import aplicationRoutes from './routes';
import 'express-async-error';
import { config } from './config';
import { CustumError, IErrorResponse } from './shared/globals/helpers/error-handler';
import Logger from 'bunyan';
 
const SERVER_PORT=5000;
const log: Logger = config.creatLogger('setupServer');


export class ChatServer {
    private app: Application;
    constructor(app: Application) {
        this.app = app;
    }

    public start(): void {
        this.securityMiddleware(this.app);
        this.standartMiddleware(this.app);
        this.routesMiddleware(this.app);
        this.globalErrorHandler(this.app);
        this.startServer(this.app);

    }

    private securityMiddleware(app: Application): void {
        app.use(
            cookieSession({
                name: 'session',
                keys: [config.SECRET_KEY_ONE!, config.SECRET_KEY_TWO!],
                maxAge: 24 * 7 * 3600000,
                secure: config.NEDE_ENV !== 'development'
            })
        );

        app.use(hpp());
        app.use(helmet());
        app.use(cors({
            origin: config.CLIENT_URL,
            credentials: true,
            optionsSuccessStatus: 200,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTHINS']
        }));    
    }

    private standartMiddleware(app: Application): void {
        app.use(compression);
        app.use(json({limit: '50mb'}));
        app.use(urlencoded({extended: true, limit: '50mb'}));
    }
    
    private routesMiddleware(app: Application): void {
        aplicationRoutes(app);
    }
    
    private globalErrorHandler(app: Application): void {
        app.all('*', (req: Request, res: Response) => {
            res.status(HTTP_STATUS.NOT_FOUND).json({message: `${req.originalUrl} not found`});
        });

        app.use((error: IErrorResponse, req: Request, res: Response, next: NextFunction) => {
            log.error(error);
            if(error instanceof CustumError) {
                return res.status(error.statusCode).json(error.serializeError);
            }
            next();
        });

    }
    
    private async startServer(app: Application): Promise<void> {
        try {
           const httpServer: HttpServer = new HttpServer(app);
           const socketIO: ServerIO = await this.createSocketIO(httpServer);

           this.socketIOConnection(socketIO);
           this.startHttpServer(httpServer);

        } catch (error) {
            log.error(error);
        }
    }
    
    private async createSocketIO(httpServer: HttpServer): Promise<ServerIO> {
        const io: ServerIO = new ServerIO(httpServer, {
            cors: {
                origin: config.CLIENT_URL,
                methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTHINS']
            }
        });
        const pubClient = createClient({url: config.REDIS_HOST});
        const subClient = pubClient.duplicate();
        await Promise.all([pubClient.connect(), subClient.connect()]);
        io.adapter(createAdapter(pubClient, subClient));
        return io;

    }

    private startHttpServer(httpServer: HttpServer): void {
        log.info(`Serever has started with proccess ${process.pid}`);
        httpServer.listen(SERVER_PORT, () => {
            log.info('Server running on port', SERVER_PORT);
        });
    }

    private socketIOConnection(io: ServerIO): void {
        
    }
}