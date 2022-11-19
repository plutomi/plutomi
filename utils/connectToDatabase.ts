import * as dotenv from 'dotenv'; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();

import * as mongoDB from 'mongodb';
import { IndexedTargetArrayItem } from '../@types/indexableProperties';
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

  const collectionName = 'data';
  const uniqueIdIndexName = 'id'; // Allows creating custom IDs tailored to the application
  const targetArray1IndexName = 'target1'; // Object[] - Multi Key Array https://www.youtube.com/watch?v=Hw87CVWuecI&t=1234s
  const targetArray2IndexName = 'target2'; // Object[] - Multi Key Array https://www.youtube.com/watch?v=Hw87CVWuecI&t=1234s

  const collectionNames = await database.listCollections({}, { nameOnly: true }).toArray();

  let db: mongoDB.Collection;
  const collectionExists = collectionNames.find((item) => item.name === collectionName);
  if (collectionExists) {
    db = database.collection(collectionName);
  } else {
    db = await database.createCollection(collectionName);
  }

  const uniqueIdIndexExists = await db.indexExists(uniqueIdIndexName);

  if (!uniqueIdIndexExists) {
    console.info(`Creating ${uniqueIdIndexName} index...`);
    const indexKey: mongoDB.IndexSpecification = { id: 1 };
    await db.createIndex(indexKey, { name: uniqueIdIndexName, unique: true });
    console.info(`Index created!`);
  }

  // target.id index
  const targetArrayIndex1Exists = await db.indexExists(targetArray1IndexName);
  if (!targetArrayIndex1Exists) {
    console.info(`Creating ${targetArray1IndexName} index...`);
    /**
     * Must match the {@link IndexedTargetArrayItem} keys
     */
    const targetArray1IndexKey: mongoDB.IndexSpecification = { 'target.id': 1 };
    await db.createIndex(targetArray1IndexKey, { name: targetArray1IndexName });
    console.info(`Index created!`);
  }

  // target.type index
  const targetArrayIndex2Exists = await db.indexExists(targetArray2IndexName);
  if (!targetArrayIndex2Exists) {
    console.info(`Creating ${targetArray2IndexName} index...`);
    /**
     * Must match the {@link IndexedTargetArrayItem} keys
     */
    const targetArray2IndexKey: mongoDB.IndexSpecification = { 'target.type': 1 };
    await db.createIndex(targetArray2IndexKey, { name: targetArray2IndexName });
    console.info(`Index created!`);
  }
  console.log('Ready.\n');

  return {
    client,
    db,
  };
};
