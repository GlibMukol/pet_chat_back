import { Request, Response, NextFunction, Errback } from 'express';
import JWT from 'jsonwebtoken';
import {config } from '@root/config';
import { NotAutorizedError } from './error-handler';
import { AuthPayload } from '@auth/interfaces/auth.interface';

export class AuthMiddleware {
  public verifyUser(req: Request, _res: Response, next: NextFunction): void {
    if(!req.session?.jwt) {
      throw new NotAutorizedError('Token is not avalible. Please login again.');
    }
    try {
      const payload: AuthPayload = JWT.verify(req.session?.jwt, config.JWB_TOKEN!) as AuthPayload;
      req.currentUser = payload;
     } catch (error) {
      throw new NotAutorizedError('Token is invalid. Please login again.');
    }
    next();
  }

  public checkAuth (req: Request, _res: Response, next: NextFunction): void {
     if(!req.session?.jwt) {
      throw new NotAutorizedError('not autorize for this route');
    }
    next();
  }
}

export const authMiddleware: AuthMiddleware = new AuthMiddleware();
