import mongoose from 'mongoose';
import { config } from './config';
import Logger from 'bunyan';

const log: Logger = config.creatLogger('setupDb');

export default () => {
    const connect = () => {
         mongoose.connect(`${config.DB_URL}`)
            .then(() => {
                log.info('Successfully connected db');
            })
           .catch((error) => {
            log.error('Error connecting db', error);
            return process.exit(1);
           });
    };
    connect();

    mongoose.connection.on('disconnected', connect);
};