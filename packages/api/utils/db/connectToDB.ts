/* eslint-disable no-console */
import {
  MongoClient,
  type Collection,
  type IndexSpecification,
  type Db
} from "mongodb";
import type { AllEntities } from "@plutomi/shared";
import { env } from "../env";
import { getDbName } from "./getDBName";

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
    client = new MongoClient(env.MONGO_URL);

    try {
      console.log("Attempting to connect to MongoDB");
      await client.connect();
    } catch (error) {
      const errorMessage = "Error connecting to MongoDB!";
      console.error(errorMessage, error);
      throw new Error(errorMessage);
    }

    const database: Db = client.db(databaseName);
    console.info(
      `Successfully connected to database: ${database.databaseName}.`
    );

    items = database.collection<AllEntities>(collectionName);

    console.info("Creating necessary collections and indexes");

    const allCollectionNames = await database.listCollections({}).toArray();
    const collectionExists = allCollectionNames.find(
      (item) => item.name === collectionName
    );

    // Define our two indexes
    const targetArrayIndexName = "targetArray";
    const targetArrayIndexSpec: IndexSpecification = {
      "target.id": 1,
      "target.type": 1
    };

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

    // ! Create the target array index, if it doesn't exist
    try {
      const targetArrayIndexExists = await items.indexExists(
        targetArrayIndexName
      );

      if (!targetArrayIndexExists) {
        try {
          await items.createIndex(targetArrayIndexSpec);
          console.log("Created target array index", targetArrayIndexName);
        } catch (error) {
          const errorMessage = `An error ocurred creating the target array index ${collectionName}`;
          console.error(errorMessage, error);
          throw new Error(errorMessage);
        }
      }
    } catch (error) {
      const errorMessage = `An error ocurred checking if the target array index exists ${collectionName}`;
      console.error(errorMessage, error);
      throw new Error(errorMessage);
    }

    console.log("Connected.\n");

    return { client, items };
  };
