import { MongoClient, Document } from 'mongodb';
import { UserEntity } from '../../models';
import { AllEntities } from '../entities/allEntityNames';

declare global {
  namespace Express {
    export interface Request {
      user: UserEntity;
      items: mongoDB.Collection<AllEntities>;
      mongoClient: MongoClient;
    }
  }
}
