import { NextFunction, Request, Response } from 'express';
import { config } from '@root/config';
import HTTP_STATUS from 'http-status-codes';
import { authService } from '@service/db/auth.service';
import { BadRequestError } from '@global/helpers/error-handler';
import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { emailSchema, passwordSchema } from '@auth/schemes/password';
import crypto from 'crypto';
import { forgotPasswordTemplate } from '@service/emails/templates/forgot-password/forgot-password-template';
import { emailQueue } from '@service/queues/email.queue';
import { IResetPasswordParams } from '@user/interfaces/user.interface';
import moment from 'moment';
import puublicId from 'ip';
import { resetPasswordTemplate } from '@service/emails/templates/reset-password/reset-password-template';

export class Password {
  @joiValidation(emailSchema)
  public async create(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const { email } = req.body;
    const existingUser: IAuthDocument = await authService.getAuthUserByEmail(
      email,
    );

    if (!existingUser) {
      return next(new BadRequestError('Invalid credentials'));
    }

    const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
    const randomCharacter: string = randomBytes.toString('hex');

    await authService.updatePwdToken(
      `${existingUser._id!}`,
      randomCharacter,
      Date.now() * 60 * 60 * 1000,
    );

    const resetLink = `${config.CLIENT_URL}/reset-password?token=${randomCharacter}`;
    const template: string = forgotPasswordTemplate.passwordResetTemplate(
      existingUser.username,
      resetLink,
    );
    emailQueue.addEmailJob('forgotsPasswordEmail', {
      template,
      receiverEmail: email,
      subject: 'Reset your password',
    });
    res.status(HTTP_STATUS.OK).json({ message: 'Password reset email send.' });
  }

  @joiValidation(passwordSchema)
  public async update(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const { password } = req.body;
    const { token } = req.params;
    const existingUser: IAuthDocument = await authService.getAuthUserByPwdToken(
      token,
    );

    if (!existingUser) {
      return next(new BadRequestError('Reset token has expired.'));
    }

    existingUser.password = password;
    existingUser.passwordResetExpires = undefined;
    existingUser.passwordResetToken = undefined;
    await existingUser.save();

    const templateParams: IResetPasswordParams = {
      username: existingUser.username,
      email: existingUser.email,
      ipaddress: puublicId.address(),
      date: moment().format('DD//MM//YYYY HH:mm'),
    };

    const template: string =
      resetPasswordTemplate.resetPasswordConfirmationTemplate(templateParams);
    emailQueue.addEmailJob('forgotsPasswordEmail', {
      template,
      receiverEmail: existingUser.email,
      subject: 'Password resert conformation',
    });
    res
      .status(HTTP_STATUS.OK)
      .json({ message: 'Password successfully updated' });
  }
}
