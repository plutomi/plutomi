import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
// https://aws.amazon.com/blogs/networking-and-content-delivery/leveraging-external-data-in-lambdaedge/
/**
 * Route the request to the closest region that is globally available.
 * This way, people in Tokyo aren't hitting us-east-1 for example. TODO, find a way to do a latency check via R53
 */

//  NOTE: Global tables are NOT being used at the moment

// const routing: { [key: string]: string } = {
// const AWS_REGION: string = process.env["AWS_REGION"]!;

//   // North America
//   "us-east-1": "us-east-1", // ~~~~Replicated~~~~ - Virginia
//   "us-east-2": "us-east-1", // Ohio --> Virginia
//   "us-west-1": "us-west-2", // California --> Oregon
//   "us-west-2": "us-west-2", // ~~~~Replicated~~~~ - Oregon
//   "ca-central-1": "us-east-1", // Canada Central --> Virginia

//   // Europe
//   "eu-central-1": "eu-central-1", // ~~~~Replicated~~~~ - Frankfurt
//   "eu-west-1": "eu-central-1", // Ireland --> Frankfurt
//   "eu-west-2": "eu-central-1", // London --> Frankfurt
//   "eu-west-3": "eu-central-1", // Paris --> Frankfurt
//   "eu-north-1": "eu-central-1", // Stockholm --> Frankfurt
//   "eu-south-1": "eu-central-1", // Milan --> Frankfurt

//   // South America
//   "sa-east-1": "us-east-1", // São Paulo --> Virginia

//   // Middle East
//   "me-south-1": "ap-south-1", // Bahrain --> Mumbai

//   // Africa
//   "af-south-1": "ap-south-1", // Cape Town --> Mumbai

//   // Asia
//   "ap-south-1": "ap-south-1", // ~~~~Replicated~~~~ - Mumbai
//   "ap-east-1": "ap-south-1", // Hong Kong --> Mumbai
//   "ap-northeast-1": "ap-south-1", // Tokyo --> Mumbai
//   "ap-northeast-2": "ap-south-1", // Seoul --> Mumbai
//   "ap-northeast-3": "ap-south-1", // Osaka --> Mumbai
//   "ap-southeast-1": "ap-southeast-2", // Singapore --> Sydney
//   "ap-southeast-2": "ap-southeast-2", // ~~~~Replicated~~~~ Sydney
// };

const global_default = "us-east-1";
const ddbClient = new DynamoDBClient({
  // region: routing[AWS_REGION] ? routing[AWS_REGION] : global_default, // To enable global regions
  region: global_default,
});
export { ddbClient };
