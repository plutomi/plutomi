import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const global_default = "us-east-1";
const ddbClient = new DynamoDBClient({
  region: global_default,
});
export { ddbClient };
