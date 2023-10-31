import { NextFunction, Request, Response } from 'express';
import { config } from '@root/config';
import JWT from 'jsonwebtoken';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import HTTP_STATUS from 'http-status-codes';
import { authService } from '@service/db/auth.service';
import { BadRequestError } from '@global/helpers/error-handler';
import { loginSchema } from '@auth/schemes/signin';
import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { IUserDocument } from '@user/interfaces/user.interface';
import { userService } from '@service/db/user.service';

export class SignIn {
  @joiValidation(loginSchema)
  public async read(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const { username, password } = req.body;
    const exitingUser: IAuthDocument = (await authService.getAuthUserByUsername(
      username,
    )) as IAuthDocument;

    if (!exitingUser) {
      return next(new BadRequestError('Invalid credentials'));
    }

    const passwordMatch: boolean = await exitingUser.comparePassword(password);
    if (!passwordMatch) {
      return next(new BadRequestError('Invalid credentials'));
    }

    const user: IUserDocument = await userService.getUserByAuthId(
      `${exitingUser._id}`,
    );

    const userJwt: string = JWT.sign(
      {
        userId: user._id,
        uId: exitingUser.uId,
        email: exitingUser.email,
        username: exitingUser.username,
        avatarColor: exitingUser.avatarColor,
      },
      config.JWB_TOKEN!,
    );
    req.session = { jwt: userJwt };
    const userDocument: IUserDocument = {
      ...user,
      authId: exitingUser!._id,
      username: exitingUser!.username,
      email: exitingUser!.email,
      avatarColor: exitingUser!.avatarColor,
      uId: exitingUser!.uId,
      createdAt: exitingUser!.createdAt,
    } as IUserDocument;

    res.status(HTTP_STATUS.OK).json({
      message: 'User login successfully',
      user: userDocument,
      token: userJwt,
    });
  }
}
