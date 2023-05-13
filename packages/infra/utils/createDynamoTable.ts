import { RemovalPolicy, type Stack } from "aws-cdk-lib";
import { BillingMode, Table, AttributeType } from "aws-cdk-lib/aws-dynamodb";
import { env } from "../env";

type CreateDynamoTableProps = {
  stack: Stack;
};

const tableName = `${env.DEPLOYMENT_ENVIRONMENT}-plutomi-wait-list`;

export const createDynamoTable = ({ stack }: CreateDynamoTableProps) => {
  const table = new Table(stack, tableName, {
    tableName,
    partitionKey: { name: "PK", type: AttributeType.STRING },
    sortKey: { name: "SK", type: AttributeType.STRING },
    billingMode: BillingMode.PAY_PER_REQUEST,
    removalPolicy: RemovalPolicy.DESTROY
  });
  return table;
};
