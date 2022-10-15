// Used within lambda functions that don't have access to the oen from req

import { MikroORM, EntityManager } from '@mikro-orm/core';
import { MongoDriver } from '@mikro-orm/mongodb';
import mikroOrmOptions from '../mikro-orm.config';

let dbInitializationPromise: Promise<MikroORM<MongoDriver>>;
let entityManager: EntityManager<MongoDriver> | undefined;

export const getEntityManager = async (): Promise<EntityManager<MongoDriver>> => {
  if (entityManager) return entityManager;

  if (!dbInitializationPromise) {
    dbInitializationPromise = MikroORM.init({
      ...mikroOrmOptions,
      pool: {
        min: 1,
        max: 1,
      },
    });
  }
  
  const db = await dbInitializationPromise;

  entityManager = db.em.fork();
  return entityManager;
};
