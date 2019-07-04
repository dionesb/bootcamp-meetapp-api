import Sequelize from 'sequelize'; // Importação do Sequelize.
import User from '../app/models/User'; // Importação do Model User
import databaseConfig from '../config/database'; // Importação das configurações
// do banco de dados.

const models = [User];

/**
 * Classe Database.
 * Esta classe é utilizada para carregar todos os models da aplicação e criar a
 * conexão com o banco de dados.
 */
class Database {
  /**
   * Método construtor da classe Database.
   */
  constructor() {
    this.init();
  }

  /**
   * Método responsável por fazer a conexão com a base de dados e carregar os
   * models.
   */
  init() {
    /* Obtém uma conexão com o banco de dados */
    this.connections = new Sequelize(databaseConfig);

    /* Percorre todos os models, chamando o método init e passando a conexão. */
    models.map(model => model.init(this.connections));
  }
}

/* Exporta a classe Database() */
export default new Database();
