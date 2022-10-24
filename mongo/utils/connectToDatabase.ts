import * as mongoDB from 'mongodb';
import { env } from '../../env';
import { Collections } from '../@types/mongo';

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

  collections.users = usersCollection;
  await collections.users.createIndex({ target: 1 });

  collections.loginLinks = loginLinksCollection;
  await collections.loginLinks.createIndex({ target: 1 });

  collections.orgs = orgsCollection;
  await collections.orgs.createIndex({ target: 1 });

  collections.openings = openingsCollection;
  await collections.openings.createIndex({ target: 1 });

  collections.stages = stagesCollection;
  await collections.stages.createIndex({ target: 1 });

  collections.questions = questionsCollection;
  await collections.questions.createIndex({ target: 1 });

  collections.webhooks = webhooksCollection;
  await collections.webhooks.createIndex({ target: 1 });

  collections.applicants = applicantsCollection;
  await collections.applicants.createIndex({ target: 1 });

  // TODO create target array index

  console.log(`Successfully connected to database: ${db.databaseName}.`);
}
