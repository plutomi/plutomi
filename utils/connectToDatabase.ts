import * as dotenv from 'dotenv'; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();

import * as mongoDB from 'mongodb';
import { Collections } from '../Config';
import { env } from '../env';

interface ConnectToDatabaseProps {
  databaseName: string;
}

interface ConnectToDatabaseResponse {
  db: mongoDB.Collection; // Our sole collection for data
  client: mongoDB.MongoClient; // Client, for any transactions etc.
}
export const connectToDatabase = async ({
  databaseName,
}: ConnectToDatabaseProps): Promise<ConnectToDatabaseResponse> => {
  const client = new mongoDB.MongoClient(env.mongoConnection);

  try {
    console.log('Attempting to connect to MongoDB.');
    await client.connect();
  } catch (error) {
    console.error(`Error connecting to MongoDB!`, error);
  }

  const database: mongoDB.Db = client.db(databaseName);
  console.log(`Successfully connected to database: ${database.databaseName}.`);
  console.log(`Creating necessary collections and indexes`);

  const db = database.collection('data');
  const indexName = 'target';
  const indexExists = await db.indexExists(indexName);

  if (!indexExists) {
    console.info(`Creating ${indexName} index...`);
    const indexKey: mongoDB.IndexSpecification = { target: 1 };
    await db.createIndex(indexKey, { name: indexName });
    console.info(`Index created!`);
  }
  console.log('Ready.\n');

  return {
    client,
    db,
  };
};
