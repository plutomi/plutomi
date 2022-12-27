import * as mongoDB from 'mongodb';
import { envVars } from '../env';
import { AllEntityNames } from './generatePlutomiId';
import { UserEntity } from '../models';

export enum CollectionName {
  items = 'items',
}

let client: mongoDB.MongoClient;
let items: mongoDB.Collection<UserEntity>;

/**
 * https://youtu.be/eEENrNKxCdw?t=2721
 * #singlecollectiondesign - https://mobile.twitter.com/houlihan_rick/status/1482144529008533504
 */

export const connectToDatabase = async () => {
  client = new mongoDB.MongoClient(envVars.MONGO_URL);

  try {
    console.log('Attempting to connect to MongoDB');
    await client.connect();
  } catch (error) {
    const errorMessage = `Error connecting to MongoDB!`;
    console.error(errorMessage, error);
    throw new Error(errorMessage);
  }

  const databaseName = 'plutomi';

  const database: mongoDB.Db = client.db(databaseName);
  console.log(`Successfully connected to database: ${database.databaseName}.`);
  const collectionName = CollectionName.items;

  items = database.collection<UserEntity>(collectionName);

  console.log(`Creating necessary collections and indexes`);

  const allCollectionNames = await database.listCollections({}).toArray();
  const collectionExists = allCollectionNames.find((item) => item.name === collectionName);

  // Define our two indexes
  const targetArrayIndexName = 'targetArray';
  const targetArrayIndexSpec: mongoDB.IndexSpecification = { 'target.id': 1, 'target.type': 1 };

  const uniqueIdIndexName = 'uniqueId';
  const uniqueIdIndexSpec: mongoDB.IndexSpecification = { uniqueId: 1 };
  const uniqueIdIndexOptions: mongoDB.CreateIndexesOptions = { unique: true };

  if (!collectionExists) {
    try {
      console.log('Creating collection', collectionName);
      await database.createCollection(collectionName);
    } catch (error) {
      console.error(`An error ocurred creating collection ${collectionName}`, error);
    }
  }

  // ! Create the target array index, if it doesn't exist
  try {
    const targetArrayIndexExists = await items.indexExists(targetArrayIndexName);

    if (!targetArrayIndexExists) {
      try {
        await items.createIndex(targetArrayIndexSpec);
      } catch (error) {
        console.error(`An error ocurred creating the target array index `, error);
      }
    }
  } catch (error) {
    console.error(`An error ocurred checking if the target array index exists`, error);
  }

  // ! Create the unique id (prefix_ksuid) index, if it doesn't exist
  try {
    const uniqueIdIndexExists = await items.indexExists(uniqueIdIndexName);

    if (!uniqueIdIndexExists) {
      try {
        await items.createIndex(uniqueIdIndexSpec, uniqueIdIndexOptions);
      } catch (error) {
        console.error(`An error ocurred creating the unique id index `, error);
      }
    }
  } catch (error) {
    console.error(`An error ocurred checking if the unique id index exists`, error);
  }

  console.log('Ready.\n');
};

export { client, items };
