import knex from "knex";
import { BaseDataBase } from '../data/BaseDatabase';
import moment from 'moment';

export class RecipeDatabase extends BaseDataBase {
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

    private static TABLE_NAME = 'Recipe'

    public async createRecipe(
        id: string, 
        title: string, 
        description: string,
        creation_date: string = moment().format("YYYY-MM-DD"),
        author_id: string
    ): Promise<void>{
        await this.getConnection()
            .insert({id, title, description, creation_date, author_id})
            .into(RecipeDatabase.TABLE_NAME);
}

public async getUserById(id: string): Promise<any> {
    const result = await this.connection()
      .select("*")
      .from(RecipeDatabase.TABLE_NAME)
      .where({ id });

      BaseDataBase.destroyConnection();

    return result[0];
  }

  public async getRecipeById(id:string): Promise<any>{
    const result = await this.connection()
      .select('*')
      .from(RecipeDatabase.TABLE_NAME)
      .where({id})

      BaseDataBase.destroyConnection()

      return result[0]
  }
}
