import * as dotenv from 'dotenv'; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();

import * as mongoDB from 'mongodb';
import { IndexedTargetArrayItem } from '../@types/indexableProperties';
import { env } from '../env';

interface ConnectToDatabaseProps {
  databaseName: string;
}
export enum CollectionNames {
  Orgs = 'Orgs',
  Applicants = 'Applicants',
  Responses = 'Responses',
}

export type AllCollectionsResponse = {
  [key in CollectionNames]: mongoDB.Collection; // Client, for any transactions etc.
};

export type ConnectToDatabaseResponse = {
  collections: AllCollectionsResponse;
  client: mongoDB.MongoClient;
};

export const collections: {
  Orgs: mongoDB.Collection;
  Applicants: mongoDB.Collection;
  Responses: mongoDB.Collection;
} = {
  Orgs: null,
  Applicants: null,
  Responses: null,
};

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

  const orgs: mongoDB.Collection = database.collection(CollectionNames.Orgs);
  collections.Orgs = orgs;

  const applicants: mongoDB.Collection = database.collection(CollectionNames.Applicants);
  collections.Applicants = applicants;

  const responses: mongoDB.Collection = database.collection(CollectionNames.Responses);
  collections.Responses = responses;

  console.log(`Creating necessary collections and indexes`);

  const collectionNames = await database.listCollections({}, { nameOnly: true }).toArray();

  Object.values(collections).map(async (collection) => {
    const { collectionName } = collection;
    const collectionExists = collectionNames.find((item) => item.name === collectionName);

    if (!collectionExists) {
      try {
        console.log('Creating collection', collectionName);
        await database.createCollection(collectionName);
      } catch (error) {
        console.error(`An error ocurred creating collection ${collectionName}`, error);
      }
    }
  });

  console.log('Ready.\n');

  return {
    client,
    collections,
  };
};
