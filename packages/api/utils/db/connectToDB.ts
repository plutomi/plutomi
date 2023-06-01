/* eslint-disable no-console */
import {
  MongoClient,
  type Collection,
  type Db,
  ServerApiVersion
} from "mongodb";
import type { AllEntities } from "@plutomi/shared";
import { env } from "../env";
import { getDbName } from "./getDbName";
import { createIndex } from "./createIndex";

export const collectionName = "items";
export const databaseName = getDbName();

let client: MongoClient;
let items: Collection<AllEntities>;

type ConnectToDatabaseResponse = {
  client: MongoClient;
  items: Collection<AllEntities>;
};

/**
 * We use a single collection for all entities, and a single index for all entities.
 * https://youtu.be/eEENrNKxCdw?t=2721
 * https://mobile.twitter.com/houlihan_rick/status/1482144529008533504
 */

export const connectToDatabase =
  async (): Promise<ConnectToDatabaseResponse> => {
    client = new MongoClient(env.MONGO_URL, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
      }
    });

    try {
      console.log("Attempting to connect to MongoDB");
      await client.db(databaseName).command({ ping: 1 });
      console.info(`Successfully connected to database: ${databaseName}.`);
    } catch (error) {
      const errorMessage = "Error connecting to MongoDB!";
      console.error(errorMessage, error);
      throw new Error(errorMessage);
    }

    const database: Db = client.db(databaseName);

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
      name: "publicOrgIdUnique",
      indexSpec: {
        publicOrgId: 1
      },
      unique: true,
      sparse: true,
      items
    });

    console.log("Done.");
    return { client, items };
  };
