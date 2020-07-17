import { BaseDataBase } from '../data/BaseDatabase';
import knex from 'knex'

export class ContentDatabase extends BaseDataBase {
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

    private static TABLE_NAME = 'Feed';

    public async followUser(authorId: string, followingId: string): Promise<void>{
            await this.getConnection()
                .insert({authorId,followingId})
                .into(ContentDatabase.TABLE_NAME)
    }

    public async getUserById(id: string): Promise<void>{
       const result = await this.connection()
            .select('*')
            .from(ContentDatabase.TABLE_NAME)
            .where({id})

        BaseDataBase.destroyConnection()

        return result[0]
    }
}