/* eslint-disable no-console */
import {
  MongoClient,
  type Collection,
  type Db,
  ServerApiVersion
} from "mongodb";
import type { AllEntities } from "@plutomi/shared";
import { createIndex } from "./createIndex";
import { env } from "./env";

const collectionName = "items";

let client: MongoClient;
let items: Collection<AllEntities>;

type ConnectToDatabaseResponse = {
  client: MongoClient;
  items: Collection<AllEntities>;
  database: Db;
};

type ConnectToDatabaseProps = {
  databaseName: "plutomi-local" | "plutomi-stage" | "plutomi-prod";
};

/**
 * We use a single collection for all entities, and a single index (mostly) for all entities.
 * https://youtu.be/eEENrNKxCdw?t=2721
 * https://mobile.twitter.com/houlihan_rick/status/1482144529008533504
 */

export const connectToDatabase = async ({
  databaseName
}: ConnectToDatabaseProps): Promise<ConnectToDatabaseResponse> => {
  client = new MongoClient(env.MONGO_URL, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true
    }
  });

  const database: Db = client.db(databaseName);

  try {
    console.log("Attempting to connect to MongoDB");
    await database.command({ ping: 1 });
    console.info(`Successfully connected to database: ${databaseName}.`);
  } catch (error) {
    const errorMessage = "Error connecting to MongoDB!";
    console.error(errorMessage, error);
    throw new Error(errorMessage);
  }

  items = database.collection<AllEntities>(collectionName);

  console.info("Creating necessary collections and indexes...");

  const allCollectionNames = await database.listCollections({}).toArray();
  const collectionExists = allCollectionNames.find(
    (item) => item.name === collectionName
  );

  if (collectionExists === undefined) {
    try {
      console.info("Creating collection", collectionName);
      await database.createCollection(collectionName);
    } catch (error) {
      const errorMessage = `Error creating collection ${collectionName}`;
      console.error(errorMessage, error);
      throw new Error(errorMessage);
    }
  }

  await createIndex({
    name: "relatedToArray",
    indexSpec: {
      "relatedTo.id": 1,
      "relatedTo.type": 1
    },
    items,
    unique: false,
    sparse: false
  });

  await createIndex({
    name: "customWorkspaceIdUnique",
    indexSpec: {
      customWorkspaceId: 1
    },
    unique: true,
    items,
    partialFilterExpression: {
      customWorkspaceId: { $exists: true }
    }
  });

  console.log("Done.");
  return { client, items, database };
};
