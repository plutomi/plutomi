import { MongoClient, Document } from 'mongodb';
import { UserEntity } from '../../models';

declare global {
  namespace Express {
    export interface Request {
      user: UserEntity;
      /**
       * The mongodb client, used for any transactions
       */
      client: MongoClient;
      /**
       * The mongodb #singlecollection for the project
       */
      db: Collection<Document>;
    }
  }
}
