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

  const collectionsThatNeedOrgIdAndCustomId = [
    openingsCollection,
    stagesCollection,
    applicantsCollection,
    questionsCollection,
    webhooksCollection,
    applicantsCollection,
    stageQuestionItemCollection,
    invitesCollection,
    usersCollection,
  ];

  const collectionsThatNeedUserIdAndCustomId = [loginLinksCollection, invitesCollection];
  const collectionsThatNeedCustomIdIndex = [usersCollection, orgsCollection];

  console.log(`Creating necessary collections and indexes`);
  const collectionData = await db.listCollections({}, { nameOnly: true }).toArray();
  const collectionNames = collectionData.map((item) => item.name);
  Object.values(collections).map(async (collection) => {
    // Create collection if it odes not exist
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
      // Create target array index on ALL entities
      if (collection) {
        const indexName = 'target';
        const indexExists = await collection.indexExists(indexName);
        if (!indexExists) {
          console.info(`Creating target array index...`);
          const indexKey: mongoDB.IndexSpecification = { target: 1 };
          await collection.createIndex(indexKey, { name: indexName });
          console.info(`Index created!`);
        }
      }

      /**
       * Create compound index of `orgId` and `id` on these entities
       * Note: This is for entities that an org directly owns, it does not apply to users
       * as that would allow a duplicate userId for people in an org and not in an org
       */
      if (collectionsThatNeedOrgIdAndCustomId.includes(collection)) {
        const indexName = 'orgId_custom_id';
        const indexExists = await collection.indexExists(indexName);

        if (!indexExists) {
          console.info(`Creating orgId and customId index...`);
          const indexKey: mongoDB.IndexSpecification = { orgId: 1, id: 1 };
          await collection.createIndex(indexKey, { name: indexName, unique: true });
          console.info(`Index created!`);
        }
      }

      /**
       * Create a compound index of `userId` and `id` on these entities.
       * This is for things like login links and org invites that belong to a user. (Org invites also belong to an org!)
       */
      if (collectionsThatNeedUserIdAndCustomId.includes(collection)) {
        const indexName = 'userId_custom_id';
        const indexExists = await collection.indexExists(indexName);

        if (!indexExists) {
          console.info(`Creating userId and customId array index...`);
          const indexKey: mongoDB.IndexSpecification = { userId: 1, id: 1 };
          await collection.createIndex(indexKey, { name: indexName, unique: true });
          console.info(`Index created!`);
        }
      }

      /**
       * Create a global index on the `id` field of a user and org as these are top level entities.
       */
      if (collectionsThatNeedCustomIdIndex.includes(collection)) {
        const indexName = 'custom_id';
        const indexExists = await collection.indexExists(indexName);

        if (!indexExists) {
          console.info(`Creating unique global id index...`);
          const indexKey: mongoDB.IndexSpecification = { id: 1 };
          await collection.createIndex(indexKey, { name: indexName, unique: true });
          console.info(`Index created!`);
        }
      }
    } catch (error) {
      console.error(`Error creating indexes!`, error);
    }
  });

  console.log(`Successfully connected to database: ${db.databaseName}.`);
};

export { mongoClient };
