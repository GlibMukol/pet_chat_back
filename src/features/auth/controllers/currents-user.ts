import HTTP_STATUS from 'http-status-codes';
import { Request, Response } from 'express';
import { UserCache } from '@root/shared/redis/user.cache';
import { IUserDocument } from '@user/interfaces/user.interface';
import { userService } from '@service/db/user.service';

const userCache: UserCache = new UserCache();
export class CurrentUser {
  public async read(req: Request, res: Response): Promise<void> {
    let isUser = false;
    let token = null;
    let user = null;
    const cachedUser: IUserDocument = await userCache.getUserFromCache(`${req.currentUser?.userId}`) as IUserDocument;
    const exitingUser: IUserDocument =  cachedUser || await userService.getUserById(`${req.currentUser?.userId}`);
    if(Object.keys(exitingUser).length) {
      isUser = true;
      token = req.session?.jwt;
      user = exitingUser;
    }
    res.status(HTTP_STATUS.OK).json({token, isUser, user});
  }
}
