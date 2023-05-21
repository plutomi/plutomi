/* eslint-disable no-console */
import {
  MongoClient,
  type Collection,
  type IndexSpecification,
  type Db,
  ServerApiVersion
} from "mongodb";
import type { AllEntities } from "@plutomi/shared";
import { env } from "../env";
import { getDbName } from "./getDbName";

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

    console.info("Creating necessary collections and indexes");

    const allCollectionNames = await database.listCollections({}).toArray();
    const collectionExists = allCollectionNames.find(
      (item) => item.name === collectionName
    );

    // Define our two indexes
    const relatedToArrayIndexName = "relatedToArray";
    const relatedToArrayIndexSpec: IndexSpecification = {
      "relatedTo.id": 1,
      "relatedTo.type": 1
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

    // ! TODO: Make this generic so we can use it for all indexes
    //  Create the relatedTo index, if it doesn't exist
    try {
      const relatedToArrayIndexExists = await items.indexExists(
        relatedToArrayIndexName
      );

      if (!relatedToArrayIndexExists) {
        try {
          await items.createIndex(relatedToArrayIndexSpec, {
            name: relatedToArrayIndexName
          });
        } catch (error) {
          const errorMessage = `An error ocurred creating the target array index: '${collectionName}'`;
          console.error(errorMessage, error);
          throw new Error(errorMessage);
        }
      }
    } catch (error) {
      const errorMessage = `An error ocurred checking if the target array index exists: '${collectionName}'`;
      console.error(errorMessage, error);
      throw new Error(errorMessage);
    }

    return { client, items };
  };
