import fs from 'fs';
import ejs from 'ejs';
import { IResetPasswordParams } from '@user/interfaces/user.interface';


class ResetPasswordTemplate {
  public resetPasswordConfirmationTemplate(tempaltesParams: IResetPasswordParams): string {
    const {username, email, ipaddress, date} = tempaltesParams;
    return ejs.render(fs.readFileSync(`${__dirname}/reset-password-template.ejs`, 'utf8'), {
      username,
      email,
      ipaddress,
      date,
      image_url: 'https://img.freepik.com/free-vector/locker_53876-25496.jpg?w=826&t=st=1697630937~exp=1697631537~hmac=a620d6c03ed28ced6c82bca016a37671ff48c52c7a2e2f48389554c82888b374'
    });
  }
}


export const resetPasswordTemplate: ResetPasswordTemplate = new ResetPasswordTemplate();
