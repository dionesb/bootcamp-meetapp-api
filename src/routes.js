import { Router } from 'express';

/* Importação dos controllers */
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';

/* Importação do Middleware responsável por fazer a autenticação */
import authMiddleware from './app/middlewares/auth';

const routes = new Router();

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

/* Exporta routes */
export default routes;
