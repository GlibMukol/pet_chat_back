import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { AuthModel } from '@auth/models/auth.schema';
import { Helpers } from '@global/helpers/helpers';

class AuthService {
  public async createAuthUser(data: IAuthDocument): Promise<void> {
    await AuthModel.create(data);
  }

  public async updatePwdToken(
    authID: string,
    token: string,
    tokenExpiration: number,
  ): Promise<void> {
    await AuthModel.updateOne(
      {
        _id: authID,
      },
      {
        passwordResetToken: token,
        passwordResetExpires: tokenExpiration,
      },
    );
  }

  public async getUserByUsernameOrEmail(
    username: string,
    email: string,
  ): Promise<IAuthDocument> {
    const query = {
      $or: [
        { username: Helpers.firstLatterUppercase(username) },
        { email: Helpers.lowerCase(email) },
      ],
    };
    const user: IAuthDocument = (await AuthModel.findOne(
      query,
    ).exec()) as IAuthDocument;
    return user;
  }

  public async getAuthUserByUsername(username: string): Promise<IAuthDocument> {
    const query = {
      username: Helpers.firstLatterUppercase(username),
    };
    const user: IAuthDocument = (await AuthModel.findOne(
      query,
    ).exec()) as IAuthDocument;
    return user;
  }

  public async getAuthUserByEmail(email: string): Promise<IAuthDocument> {
    const query = {
      username: Helpers.lowerCase(email),
    };
    const user: IAuthDocument = (await AuthModel.findOne(
      query,
    ).exec()) as IAuthDocument;
    return user;
  }

  public async getAuthUserByPwdToken(token: string): Promise<IAuthDocument> {
    const query = {
      passwordResetToken: token,
      passwordResetExpires: { $qt: Date.now() },
    };
    const user: IAuthDocument = (await AuthModel.findOne(
      query,
    ).exec()) as IAuthDocument;
    return user;
  }
}

export const authService: AuthService = new AuthService();
