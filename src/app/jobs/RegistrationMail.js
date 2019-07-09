import { format } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class RegistrationMail {
  get key() {
    return 'RegistrationMail';
  }

  async handle({ data }) {
    const { meetup, user } = data;

    await Mail.sendMail({
      to: `${meetup.user.name} <${meetup.user.email}>`,
      subject: 'Nova inscrição',
      template: 'registration',
      context: {
        manager: meetup.user.name,
        meetup: meetup.title,
        user: user.name,
        date: format(new Date(), "'dia' dd 'de' MMMM', às' H:mm'h'", {
          locale: pt,
        }),
      },
    });
  }
}

export default new RegistrationMail();
