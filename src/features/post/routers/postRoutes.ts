import express, { Router } from 'express';
import { authMiddleware } from '@global/helpers/auth-middleware';
import { Create } from '@post/controllers/create-post';

class PostRouters {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    return this.router;
  }

  public read(): Router {
    this.router.post(
      '/post',
      authMiddleware.checkAuth,
      Create.prototype.post,
    );
    return this.router;
  }
}

export const postRoutes: PostRouters =
  new PostRouters();
