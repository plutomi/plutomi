import * as cdk from "@aws-cdk/core";
import dynamodb = require("@aws-cdk/aws-dynamodb");

/**
 * Creates a DynamoDB table with two GSIs
 */
export class DynamoDBStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const TABLE_NAME = "Plutomi";

    const table = new dynamodb.Table(this, "plutomi-dynamo-table", {
      tableName: TABLE_NAME,
      partitionKey: { name: "PK", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "SK", type: dynamodb.AttributeType.STRING },
      timeToLiveAttribute: "ttlExpiry",
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
    });

    table.addGlobalSecondaryIndex({
      indexName: "GSI1",
      partitionKey: { name: "GSI1PK", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "GSI1SK", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    table.addGlobalSecondaryIndex({
      indexName: "GSI2",
      partitionKey: { name: "GSI2PK", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "GSI2SK", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    new cdk.CfnOutput(this, "DynamoDB Table ARN", {
      value: table.tableArn ?? "Something went wrong with the Dynamo deploy",
    });
  }
}
