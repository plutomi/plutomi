import { MongoClient } from 'mongodb';
import { UserEntity } from '../../models';

declare global {
  namespace Express {
    export interface Request {
      user: UserEntity;
      client: MongoClient;
      db: Collection<Document>;
    }
  }
}
