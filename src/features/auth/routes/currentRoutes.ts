import express, {Router} from 'express';
import { CurrentUser } from '@auth/controllers/currents-user';
import { authMiddleware} from '@global/helpers/auth-middleware';
class CurrentsUserRoputes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {

    return this.router;
  }

  public read(): Router {

    this.router.get('/currentuser', authMiddleware.checkAuth, CurrentUser.prototype.read);
    return this.router;
  }


}

export const currentsUserRoutes: CurrentsUserRoputes = new CurrentsUserRoputes();
