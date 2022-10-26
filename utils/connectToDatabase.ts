import * as mongoDB from 'mongodb';
import { Collections } from '../Config';
import { env } from '../env';
import { UserEntity } from '../models';

export const collections: {
  users?: mongoDB.Collection;
  loginLinks?: mongoDB.Collection;
  orgs?: mongoDB.Collection;
  openings?: mongoDB.Collection;
  stages?: mongoDB.Collection;
  questions?: mongoDB.Collection;
  webhooks?: mongoDB.Collection;
  applicants?: mongoDB.Collection;
} = {};

let mongoClient: mongoDB.MongoClient | undefined;

export async function connectToDatabase() {
  const client = new mongoDB.MongoClient(env.mongoConnection);

  mongoClient = client;
  try {
    console.log('Attempting to connect to MongoDB.');
    await client.connect();
  } catch (error) {
    console.error(`Error connecting to MongoDB!`, error);
  }

  const db: mongoDB.Db = client.db(env.deploymentEnvironment);

  const usersCollection: mongoDB.Collection = db.collection(Collections.Users);
  const loginLinksCollection: mongoDB.Collection = db.collection(Collections.LoginLinks);
  const orgsCollection: mongoDB.Collection = db.collection(Collections.Orgs);
  const openingsCollection: mongoDB.Collection = db.collection(Collections.Openings);
  const stagesCollection: mongoDB.Collection = db.collection(Collections.Stages);
  const questionsCollection: mongoDB.Collection = db.collection(Collections.Questions);
  const webhooksCollection: mongoDB.Collection = db.collection(Collections.Webhooks);
  const applicantsCollection: mongoDB.Collection = db.collection(Collections.Applicants);

  const indexKey: mongoDB.IndexSpecification = { target: 1 };

  collections.users = usersCollection;
  collections.loginLinks = loginLinksCollection;
  collections.orgs = orgsCollection;
  collections.openings = openingsCollection;
  collections.stages = stagesCollection;
  collections.questions = questionsCollection;
  collections.webhooks = webhooksCollection;
  collections.applicants = applicantsCollection;

  console.log(`Creating necessary indexes`);
  Object.values(collections).map(async (collection) => {
    try {
      console.log(`Creating target index on ${collection.collectionName}`);
      await collection.createIndex(indexKey);
    } catch (error) {
      console.error(`Error creating index!`, error);
    }
  });

  console.log(`Created!`);

  console.log(`Successfully connected to database: ${db.databaseName}.`);
}

export { mongoClient };
