import { RemovalPolicy, type Stack } from "aws-cdk-lib";
import { BillingMode, Table, AttributeType } from "aws-cdk-lib/aws-dynamodb";
import { env } from "../env";

type CreateDynamoTableProps = {
  stack: Stack;
};

export const createDynamoTable = ({ stack }: CreateDynamoTableProps) => {
  const table = new Table(
    stack,
    `${env.DEPLOYMENT_ENVIRONMENT}-plutomi-wait-list`,
    {
      partitionKey: { name: "PK", type: AttributeType.STRING },
      sortKey: { name: "SK", type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY
    }
  );
  return table;
};
