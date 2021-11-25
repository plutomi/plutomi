import * as cdk from "@aws-cdk/core";
import dynamodb = require("@aws-cdk/aws-dynamodb");
require("dotenv").config();
import { get } from "env-var";

/**
 * Creates a DynamoDB table with two GSIs
 */
export class DynamoDBStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const TABLE_NAME: string = get("DYNAMO_TABLE_NAME").required().asString();

    console.log("In dynamo stack", TABLE_NAME);
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

    // Exports the ARN of the table so we can access it in other stacks
    new cdk.CfnOutput(this, "DynamoDB-Table-ARN", {
      value: table.tableArn ?? "Something went wrong with the Dynamo deploy",
      exportName: "DynamoDB-Table-ARN",
    });

    // Exports the name of the table so we can access it in other stacks
    new cdk.CfnOutput(this, "DynamoDB-Table-Name", {
      value: table.tableName ?? "Something went wrong with the Dynamo deploy",
      exportName: "DynamoDB-Table-Name",
    });
  }
}
