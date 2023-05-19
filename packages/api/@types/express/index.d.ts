import type { MongoClient } from "mongodb";
import type { UserEntity } from "../../models";

declare global {
  namespace Express {
    export type Request = {
      user: UserEntity;
      items: mongoDB.Collection<AllEntities>;
      mongoClient: MongoClient;
    };
  }
}
