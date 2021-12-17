import * as cdk from "@aws-cdk/core";
import {
  Table,
  AttributeType,
  BillingMode,
  StreamViewType,
  ProjectionType,
} from "@aws-cdk/aws-dynamodb";
import * as dotenv from "dotenv";
const resultDotEnv = dotenv.config({
  path: __dirname + `../../.env.${process.env.NODE_ENV}`,
});

if (resultDotEnv.error) {
  throw resultDotEnv.error;
}

/**
 * Creates a DynamoDB table with two GSIs
 */
export default class DynamoDBStack extends cdk.Stack {
  public readonly table: Table;
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const TABLE_NAME: string = process.env.DYNAMO_TABLE_NAME;
    this.table = new Table(this, "plutomi-dynamo-table", {
      tableName: TABLE_NAME,
      partitionKey: { name: "PK", type: AttributeType.STRING },
      sortKey: { name: "SK", type: AttributeType.STRING },
      timeToLiveAttribute: "ttlExpiry",
      billingMode: BillingMode.PAY_PER_REQUEST,
      stream: StreamViewType.NEW_AND_OLD_IMAGES,
    });

    this.table.addGlobalSecondaryIndex({
      indexName: "GSI1",
      partitionKey: { name: "GSI1PK", type: AttributeType.STRING },
      sortKey: { name: "GSI1SK", type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
    });

    this.table.addGlobalSecondaryIndex({
      indexName: "GSI2",
      partitionKey: { name: "GSI2PK", type: AttributeType.STRING },
      sortKey: { name: "GSI2SK", type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
    });
  }
}
