import { authRoutes } from '@auth/routes/authRoutes';
import { currentsUserRoutes } from '@auth/routes/currentRoutes';
import { authMiddleware } from '@global/helpers/auth-middleware';
import { postRoutes } from '@post/routers/postRoutes';
import { serverAdapter } from '@service/queues/base.queue';
import { Application } from 'express';

const BASE_PATH = '/api/v1';

export default (app: Application) => {
  const routes = () => {
    app.use('/queuses', serverAdapter.getRouter());
    app.use(BASE_PATH, authRoutes.routes());
    app.use(BASE_PATH, authRoutes.signOUtRoutes());

    app.use(BASE_PATH, authMiddleware.verifyUser, currentsUserRoutes.read());
    app.use(BASE_PATH, authMiddleware.verifyUser, postRoutes.read());
  };
  routes();
};
