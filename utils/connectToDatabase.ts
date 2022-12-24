import * as mongoDB from 'mongodb';
import { IndexedTargetArrayItem } from '../@types/indexableProperties';
import { envVars } from '../env';

export enum CollectionName {
  items = 'items',
}

export type ConnectToDatabaseResponse = {
  /**
   * https://youtu.be/eEENrNKxCdw?t=2721
   * #singlecollectiondesign - https://mobile.twitter.com/houlihan_rick/status/1482144529008533504
   */
  db: mongoDB.Collection;
  client: mongoDB.MongoClient;
};

export const connectToDatabase = async (): Promise<ConnectToDatabaseResponse> => {
  const client = new mongoDB.MongoClient(envVars.MONGO_URL);

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

  const db: mongoDB.Collection = database.collection(collectionName);

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
    const targetArrayIndexExists = await db.indexExists(targetArrayIndexName);

    if (!targetArrayIndexExists) {
      try {
        await db.createIndex(targetArrayIndexSpec);
      } catch (error) {
        console.error(`An error ocurred creating the target array index `, error);
      }
    }
  } catch (error) {
    console.error(`An error ocurred checking if the target array index exists`, error);
  }

  // ! Create the unique id (prefix_ksuid) index, if it doesn't exist
  try {
    const uniqueIdIndexExists = await db.indexExists(uniqueIdIndexName);

    if (!uniqueIdIndexExists) {
      try {
        await db.createIndex(uniqueIdIndexSpec, uniqueIdIndexOptions);
      } catch (error) {
        console.error(`An error ocurred creating the unique id index `, error);
      }
    }
  } catch (error) {
    console.error(`An error ocurred checking if the unique id index exists`, error);
  }

  console.log('Ready.\n');

  return {
    client,
    db,
  };
};
