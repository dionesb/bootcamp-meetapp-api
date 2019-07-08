import * as Yup from 'yup'; // importa todas as funções da extensão Yup
import { Op } from 'sequelize';
import {
  startOfHour,
  isBefore,
  parseISO,
  startOfDay,
  endOfDay,
} from 'date-fns';
import Meetup from '../models/Meetup';
import File from '../models/File';
import User from '../models/User';

class MeetupController {
  async index(req, res) {
    const where = {};
    const page = req.query.page || 1;

    if (req.query.date) {
      const searchDate = parseISO(req.query.date);

      where.date = {
        [Op.between]: [startOfDay(searchDate), endOfDay(searchDate)],
      };
    }

    const meetups = await Meetup.findAll({
      where,
      order: ['date'],
      attributes: ['title', 'description', 'localization', 'date', 'banner'],
      limit: 10,
      offset: (page - 1) * 10,
      include: [
        {
          model: File,
          as: 'file_banner',
          attributes: ['id', 'path', 'url'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name'],
        },
      ],
    });

    return res.json(meetups);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string().required(),
      localization: Yup.string().required(),
      date: Yup.date().required(),
      banner: Yup.number().required(),
    });

    /* Valida o objeto req.body conforme o schema, caso seja falso, retorna um
    erro 400 */
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { title, description, localization, date, banner } = req.body;

    const hourStart = startOfHour(parseISO(date));

    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({ error: 'Past dates are not permitted' });
    }

    const meetup = await Meetup.create({
      title,
      description,
      localization,
      date,
      banner,
      user_id: req.userId,
    });

    return res.json(meetup);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string(),
      description: Yup.string(),
      localization: Yup.string(),
      date: Yup.date(),
      banner: Yup.number(),
    });

    /* Valida o objeto req.body conforme o schema, caso seja falso, retorna um
    erro 400 */
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const meetup = await Meetup.findByPk(req.params.id);

    if (meetup.user_id !== req.userId) {
      return res
        .status(401)
        .json({ error: "You don't have permission to edit this Meetup" });
    }

    if (isBefore(meetup.date, new Date())) {
      return res.status(400).json({ error: 'This Meetup is in the past' });
    }

    const { date } = req.body;

    const newDate = parseISO(date);

    if (isBefore(newDate, new Date())) {
      return res.status(400).json({ error: 'Past dates are not permitted' });
    }

    const meetupUpdated = await meetup.update(req.body);

    return res.json(meetupUpdated);
  }

  async delete(req, res) {
    const meetup = await Meetup.findByPk(req.params.id);

    if (meetup.user_id !== req.userId) {
      return res.status(401).json({
        error: "You don't have permission to cancel this appointment.",
      });
    }

    if (isBefore(meetup.date, new Date())) {
      return res.status(401).json({
        error: 'You can not cancel a Meetup that has already happened.',
      });
    }

    meetup.destroy();

    return res.json({ success: 'The Metup was deleted successfully.' });
  }
}

export default new MeetupController();
