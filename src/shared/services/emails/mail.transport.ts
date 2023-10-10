import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import Logger from 'bunyan';
import sendGridMail from '@sendgrid/mail';
import { config } from '@root/config';
import { BadRequestError } from '@global/helpers/error-handler';

interface IMailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
}


const log: Logger = config.creatLogger('mailOption');

sendGridMail.setApiKey(config.SEND_GRIG_API_KEY!);

class MailTransport {

  public async sendEmail(receiverEmail: string, subject: string, body: string): Promise<void> {
    config.NEDE_ENV === 'test' || config.NEDE_ENV === 'development' ?
          this.developmentEmailSender(receiverEmail, subject, body) :
          this.productionEmailSender(receiverEmail, subject, body);
  }

  private async developmentEmailSender(receiverEmail: string, subject: string, body: string): Promise<void> {

    const transporter: Mail = nodemailer.createTransport({
      host: 'smtp.forwardemail.net',
      port: 465,
      secure: false,
      auth: {
        // TODO: replace `user` and `pass` values from <https://forwardemail.net>
        user: config.SENDER_EMAIL,
        pass: config.SENDER_EMAIL_PASSWORD,
      },
    });

    const mailOptions: IMailOptions = {
      from: `Pet app <${config.SENDER_EMAIL}>`,
      to: receiverEmail,
      subject,
      html: body
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (error) {
      log.error('Error sending email', error);
      throw new BadRequestError('Error sending email');
    }
  }

  private async productionEmailSender(receiverEmail: string, subject: string, body: string): Promise<void> {

    const mailOptions: IMailOptions = {
      from: `Pet app <${config.SENDER_EMAIL}>`,
      to: receiverEmail,
      subject,
      html: body
    };

    try {
      await sendGridMail.send(mailOptions);
      log.info('Production mail send successfully');
    } catch (error) {
      log.error('Error sending email', error);
      throw new BadRequestError('Error sending email');
    }
  }

}

export const mailTransport: MailTransport = new MailTransport();
