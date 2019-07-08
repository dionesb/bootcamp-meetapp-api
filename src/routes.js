import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

/* Importação dos controllers */
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import MeetupController from './app/controllers/MeetupController';
import RegistrationController from './app/controllers/RegistrationController';
import OrganizingController from './app/controllers/OrganizingController';
import FileController from './app/controllers/FileController';

/* Importação do Middleware responsável por fazer a autenticação */
import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

/**
 * Rota que cria um novo usuário.
 */
routes.post('/users', UserController.store);

/**
 * Rota que cria uma sessão para o usuário.
 */
routes.post('/sessions', SessionController.store);

/**
 * A partir deste ponto todas as requisições serão autenticadas.
 */
routes.use(authMiddleware);

/**
 * Rota responsável por autualizar um usuário.
 */
routes.put('/users', UserController.update);

/**
 * Rota reponsável por listar os Meetups.
 */
routes.get('/meetups', MeetupController.index);

/**
 * Rota reponsável por criar um Meetups.
 */
routes.post('/meetups', MeetupController.store);

/**
 * Rota reponsável por editar um Meetups.
 */
routes.put('/meetups/:id', MeetupController.update);

/**
 * Rota reponsável por deletar um Meetups.
 */
routes.delete('/meetups/:id', MeetupController.delete);

/**
 * Rota reponsável por lista as Registration.
 */
routes.get('/organizing', OrganizingController.index);

/**
 * Rota reponsável por lista as Registration.
 */
routes.get('/registrations', RegistrationController.index);

/**
 * Rota reponsável por criar um Registration.
 */
routes.post('/meetups/:id/registrations', RegistrationController.store);

/**
 * Rota reponsável por criar um file.
 */
routes.post('/files', upload.single('file'), FileController.store);

/* Exporta routes */
export default routes;
