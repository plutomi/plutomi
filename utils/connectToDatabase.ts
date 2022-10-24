import * as mongoDB from 'mongodb';
import { Collections } from '../Config';
import { env } from '../env';

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

export async function connectToDatabase() {
  const client: mongoDB.MongoClient = new mongoDB.MongoClient(env.mongoConnection);

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
  const indexOptions: mongoDB.CreateIndexesOptions = { unique: true };

  collections.users = usersCollection;
  await collections.users.createIndex(indexKey, indexOptions);

  collections.loginLinks = loginLinksCollection;
  await collections.loginLinks.createIndex(indexKey, indexOptions);

  collections.orgs = orgsCollection;
  await collections.orgs.createIndex(indexKey, indexOptions);

  collections.openings = openingsCollection;
  await collections.openings.createIndex(indexKey, indexOptions);

  collections.stages = stagesCollection;
  await collections.stages.createIndex(indexKey, indexOptions);

  collections.questions = questionsCollection;
  await collections.questions.createIndex(indexKey, indexOptions);

  collections.webhooks = webhooksCollection;
  await collections.webhooks.createIndex(indexKey, indexOptions);

  collections.applicants = applicantsCollection;
  await collections.applicants.createIndex(indexKey, indexOptions);

  // TODO create target array index

  console.log(`Successfully connected to database: ${db.databaseName}.`);
}
