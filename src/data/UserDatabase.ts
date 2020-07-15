import knex from "knex"
import { BaseDataBase } from '../data/BaseDatabase'

export class UserDatabase extends BaseDataBase {
  /*Comunicação com o Banco de dados*/
  private connection = knex({
    client: "mysql",
    connection: {
      host: process.env.DB_HOST,
      port: 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE_NAME,
    },
  })
  /*Comunicação com o Banco de dados*/

  private static TABLE_NAME = 'User'

  public async createUser(id: string, name: string, email: string, password: string): Promise<void> {
    await this.getConnection()
      .insert({ id, name, email, password })
      .into(UserDatabase.TABLE_NAME)
  }

  public async getUserByEmail(email: string): Promise<any> {
    const result = await this.connection
      .select("*")
      .from(UserDatabase.TABLE_NAME)
      .where({ email });

    BaseDataBase.destroyConnection();

    return result[0];
  }

};

