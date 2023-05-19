import type { MongoClient } from "mongodb";
import type { UserEntity } from "../../models";
import type { AllEntities } from "../entities/allEntityNames";

declare global {
  namespace Express {
    export type Request = {
      user: UserEntity;
      items: mongoDB.Collection<AllEntities>;
      mongoClient: MongoClient;
    };
  }
}
