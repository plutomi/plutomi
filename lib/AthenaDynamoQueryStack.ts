import * as dotenv from "dotenv";
import * as cdk from "@aws-cdk/core";
import { Table } from "@aws-cdk/aws-dynamodb";
import * as sam from "@aws-cdk/aws-sam";
import * as s3 from "@aws-cdk/aws-s3";
const resultDotEnv = dotenv.config({
  path: `${process.cwd()}/.env.${process.env.NODE_ENV}`,
});

if (resultDotEnv.error) {
  throw resultDotEnv.error;
}

interface AthenaDynamoQueryStackProps extends cdk.StackProps {
  table: Table;
  bucket: s3.Bucket;
}

export default class AthenaDynamoQueryStack extends cdk.Stack {
  constructor(
    scope: cdk.Construct,
    id: string,
    props?: AthenaDynamoQueryStackProps
  ) {
    super(scope, id, props);

    new sam.CfnApplication(
      this,
      `${process.env.NODE_ENV}-AthenaDynamoQueryApplication`,
      {
        location: {
          applicationId: `arn:aws:serverlessrepo:us-east-1:292517598671:applications/AthenaDynamoDBConnector`,
          semanticVersion: "2022.4.1",
        },
        // https://github.com/awslabs/aws-athena-query-federation/blob/master/athena-dynamodb/athena-dynamodb.yaml
        parameters: {
          SpillBucket: props.bucket.bucketName,
          AthenaCatalogName: `${process.env.NODE_ENV}-athena-dynamo-query-function`,
          // Gotta love it, must be strings! :D
          LambdaTimeout: "900",
          LambdaMemory: "10000",
        },
      }
    );
  }
}
