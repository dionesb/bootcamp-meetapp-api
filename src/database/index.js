import Sequelize from 'sequelize'; // Importação do Sequelize.
import User from '../app/models/User'; // Importação do Model User
import File from '../app/models/File'; // Importação do Model File
import Meetup from '../app/models/Meetup'; // Importação do Model Meetup
import databaseConfig from '../config/database'; // Importação das configurações
// do banco de dados.

const models = [User, File, Meetup];

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
    models
      .map(model => model.init(this.connections))
      .map(
        model => model.associate && model.associate(this.connections.models)
      );
  }
}

/* Exporta a classe Database() */
export default new Database();
