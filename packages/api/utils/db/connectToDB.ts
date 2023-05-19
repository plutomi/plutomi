/* eslint-disable no-console */
import {
  MongoClient,
  type Collection,
  type IndexSpecification,
  type Db
} from "mongodb";
import type { AllEntities } from "@plutomi/shared";
import { env } from "../env";

export const collectionName = "items";
export const databaseName = "plutomi";

let client: MongoClient;
let items: Collection<AllEntities>;

type ConnectToDatabaseResponse = {
  client: MongoClient;
  items: Collection<AllEntities>;
};

/**
 * https://youtu.be/eEENrNKxCdw?t=2721
 * Single Collection Design - https://mobile.twitter.com/houlihan_rick/status/1482144529008533504
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
    console.log(
      `Successfully connected to database: ${database.databaseName}.`
    );

    items = database.collection<AllEntities>(collectionName);

    console.log("Creating necessary collections and indexes");

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
        console.log("Creating collection", collectionName);
        await database.createCollection(collectionName);
      } catch (error) {
        console.error(
          `An error ocurred creating collection ${collectionName}`,
          error
        );
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
        } catch (error) {
          console.error(
            "An error ocurred creating the target array index ",
            error
          );
        }
      }
    } catch (error) {
      console.error(
        "An error ocurred checking if the target array index exists",
        error
      );
    }
    console.log("Ready.\n");

    return { client, items };
  };