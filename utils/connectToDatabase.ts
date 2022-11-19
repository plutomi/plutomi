import * as dotenv from 'dotenv'; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();

import * as mongoDB from 'mongodb';
import { Collections } from '../Config';
import { env } from '../env';

let mongoClient: mongoDB.MongoClient | undefined;

interface ConnectToDatabaseProps {
  databaseName: string;
}
export const connectToDatabase = async ({
  databaseName,
}: ConnectToDatabaseProps): Promise<mongoDB.MongoClient> => {
  const client = new mongoDB.MongoClient(env.mongoConnection);

  try {
    console.log('Attempting to connect to MongoDB.');
    await client.connect();
  } catch (error) {
    console.error(`Error connecting to MongoDB!`, error);
  }

  const db: mongoDB.Db = client.db(databaseName);
  console.log(`Successfully connected to database: ${db.databaseName}.`);

  console.log(`Creating necessary collections and indexes`);

  const collection = db.collection('data');
  const indexName = 'target';
  const indexExists = await collection.indexExists(indexName);

  if (!indexExists) {
    console.info(`Creating ${indexName} index...`);
    const indexKey: mongoDB.IndexSpecification = { target: 1 };
    await collection.createIndex(indexKey, { name: indexName });
    console.info(`Index created!`);
  }

  console.log('Ready.\n');
  return client;
};
