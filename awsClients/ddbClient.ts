import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const globalDefault = "us-east-1";
const ddbClient = new DynamoDBClient({
  region: globalDefault,
});
export { ddbClient };
