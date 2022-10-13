import { MikroORM } from '@mikro-orm/core';
import { MongoDriver } from '@mikro-orm/mongodb';
import mikroOrmOptions from '../mikro-orm.config';

export const initializeDb = async () => {
  let orm: MikroORM<MongoDriver>;
  try {
    console.log('Attempting to connect to mongodb');
    orm = await MikroORM.init<MongoDriver>(mikroOrmOptions);
    return orm;
  } catch (error) {
    console.error(`Error ocurred connecting to MONGO`, error);
    throw new Error('Crashing');
  }
};
