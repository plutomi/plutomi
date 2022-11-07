import * as dotenv from 'dotenv'; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();

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
  invites?: mongoDB.Collection;
  stageQuestionItem?: mongoDB.Collection;
} = {};

let mongoClient: mongoDB.MongoClient | undefined;

export const connectToDatabase = async () => {
  const client = new mongoDB.MongoClient(env.mongoConnection);

  mongoClient = client; // TODO export this and pass it to the .req
  try {
    console.log('Attempting to connect to MongoDB.');
    await client.connect();
  } catch (error) {
    console.error(`Error connecting to MongoDB!`, error);
  }

  const db: mongoDB.Db = client.db('development');

  const usersCollection: mongoDB.Collection = db.collection(Collections.Users);
  const loginLinksCollection: mongoDB.Collection = db.collection(Collections.LoginLinks);
  const orgsCollection: mongoDB.Collection = db.collection(Collections.Orgs);
  const openingsCollection: mongoDB.Collection = db.collection(Collections.Openings);
  const stagesCollection: mongoDB.Collection = db.collection(Collections.Stages);
  const questionsCollection: mongoDB.Collection = db.collection(Collections.Questions);
  const stageQuestionItemCollection: mongoDB.Collection = db.collection(
    Collections.StageQuestionItem,
  );
  const webhooksCollection: mongoDB.Collection = db.collection(Collections.Webhooks);
  const applicantsCollection: mongoDB.Collection = db.collection(Collections.Applicants);
  const invitesCollection: mongoDB.Collection = db.collection(Collections.Invites);

  collections.users = usersCollection;
  collections.loginLinks = loginLinksCollection;
  collections.orgs = orgsCollection;
  collections.openings = openingsCollection;
  collections.stages = stagesCollection;
  collections.questions = questionsCollection;
  collections.webhooks = webhooksCollection;
  collections.applicants = applicantsCollection;
  collections.invites = invitesCollection;
  collections.stageQuestionItem = stageQuestionItemCollection;

  console.log(`Creating necessary collections and indexes`);

  const collectionData = await db.listCollections({}, { nameOnly: true }).toArray();
  const collectionNames = collectionData.map((item) => item.name);
  Object.values(collections).map(async (collection) => {
    if (!collectionNames.includes(collection.collectionName)) {
      try {
        console.log('Creating collection', collection.collectionName);
        await db.createCollection(collection.collectionName);
        console.log('Collection created!');
      } catch (error) {
        console.error(`Error creating collection`, collection.collectionName);
      }
    }

    try {
      const targetArrayIndexName = 'target';
      const targetIndexExists = await collection.indexExists(targetArrayIndexName);

      if (!targetIndexExists) {
        console.info(`Creating target array index...`);
        const indexKey: mongoDB.IndexSpecification = { target: 1 };
        await collection.createIndex(indexKey, { name: targetArrayIndexName });
        console.info(`Index created!`);
      }

      const customIdIndexName = 'custom_id';
      const customIdIndexExists = await collection.indexExists(customIdIndexName);

      if (!customIdIndexExists) {
        console.info(`Creating Custom ID index...`);
        await collection.createIndex('id', { name: customIdIndexName, unique: true });
        console.info(`Index created!`);
      }
    } catch (error) {
      console.error(`Error creating index!`, error);
    }
  });

  console.log(`Successfully connected to database: ${db.databaseName}.`);
};

export { mongoClient };
