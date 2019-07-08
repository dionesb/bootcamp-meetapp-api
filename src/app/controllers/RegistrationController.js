import { Op } from 'sequelize';
import { isBefore, format } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Registration from '../models/Registration';
import Meetup from '../models/Meetup';
import Mail from '../../lib/Mail';
import User from '../models/User';

class RegistrationController {
  async index(req, res) {
    const registrations = await Registration.findAll({
      where: { user_id: req.userId },
      include: [
        {
          model: Meetup,
          as: 'meetup',
          where: {
            date: {
              [Op.gt]: new Date(),
            },
          },
          required: true,
        },
      ],
      order: [['meetup', 'date']],
    });

    return res.json(registrations);
  }

  async store(req, res) {
    const user = await User.findByPk(req.userId);
    const meetup = await Meetup.findByPk(req.params.id, {
      include: [{ model: User, as: 'user' }],
    });

    /* Verifica se o User é dono da Meetup. */
    if (meetup.user_id === req.userId) {
      return res
        .status(401)
        .json({ error: 'You can not sign up for your own Meetup.' });
    }

    /* Verifica se Meetup já aconteceu. */
    if (isBefore(meetup.date, new Date())) {
      return res.status(400).json({ error: 'This Meetup is in the past.' });
    }

    /* Retorna se o usuário já estiver cadastrado neste Meetup. */
    const userAlreadyRegistered = await Registration.findOne({
      where: {
        user_id: req.userId,
        meetup_id: req.params.id,
      },
    });

    /* Verifica se o User já está cadastrado na Meetup. */
    if (userAlreadyRegistered) {
      return res
        .status(400)
        .json({ error: 'You are already signed up for this Meetup.' });
    }

    /* Retorna um Meetup se o user estiver cadastrado  no mesmo horário. */
    const sameHour = await Registration.findOne({
      where: {
        user_id: req.userId,
      },
      include: [
        {
          model: Meetup,
          as: 'meetup',
          required: true,
          where: {
            date: meetup.date,
          },
        },
      ],
    });

    if (sameHour) {
      return res.status(400).json({
        error: "You're already signed up for a Meetup at this time.",
      });
    }

    const registration = await Registration.create({
      user_id: req.userId,
      meetup_id: req.params.id,
    });

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

    return res.json(registration);
  }
}

export default new RegistrationController();
