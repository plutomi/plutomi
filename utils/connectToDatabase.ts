import * as dotenv from 'dotenv'; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();

import * as mongoDB from 'mongodb';
import { IndexedTargetArrayItem } from '../@types/indexableProperties';
import { env } from '../env';

interface ConnectToDatabaseProps {
  databaseName: string;
}

export enum CollectionName {
  db = 'db',
}

export type ConnectToDatabaseResponse = {
  /**
   * https://youtu.be/eEENrNKxCdw?t=2721
   * #singlecollectiondesign - https://mobile.twitter.com/houlihan_rick/status/1482144529008533504
   */
  db: mongoDB.Collection;
  client: mongoDB.MongoClient;
};

export const connectToDatabase = async ({
  databaseName,
}: ConnectToDatabaseProps): Promise<ConnectToDatabaseResponse> => {
  const client = new mongoDB.MongoClient(env.mongoConnection);

  try {
    console.log('Attempting to connect to MongoDB');
    await client.connect();
  } catch (error) {
    const errorMessage = `Error connecting to MongoDB!`;
    console.error(errorMessage, error);
    throw new Error(errorMessage);
  }

  const database: mongoDB.Db = client.db(databaseName);
  console.log(`Successfully connected to database: ${database.databaseName}.`);
  const collectionName = CollectionName.db;

  const db: mongoDB.Collection = database.collection(collectionName);

  console.log(`Creating necessary collections and indexes`);

  const allCollectionNames = await database.listCollections({}, { nameOnly: true }).toArray();
  const collectionExists = allCollectionNames.find((item) => item.name === collectionName);

  if (!collectionExists) {
    try {
      console.log('Creating collection', collectionName);
      await database.createCollection(collectionName);
    } catch (error) {
      console.error(`An error ocurred creating collection ${collectionName}`, error);
    }
  }

  console.log('Ready.\n');

  return {
    client,
    db,
  };
};
