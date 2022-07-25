import * as cdk from 'aws-cdk-lib';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import * as sam from 'aws-cdk-lib/aws-sam';
import * as s3 from 'aws-cdk-lib/aws-s3';

interface AthenaDynamoQueryStackProps extends cdk.StackProps {
  table: Table;
  bucket: s3.Bucket;
}

export default class AthenaDynamoQueryStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: AthenaDynamoQueryStackProps) {
    super(scope, id, props);

    new sam.CfnApplication(this, `${process.env.NODE_ENV}-AthenaDynamoQueryApplication`, {
      location: {
        applicationId: `arn:aws:serverlessrepo:us-east-1:292517598671:applications/AthenaDynamoDBConnector`,
        semanticVersion: '2022.4.1',
      },
      // https://github.com/awslabs/aws-athena-query-federation/blob/master/athena-dynamodb/athena-dynamodb.yaml
      parameters: {
        SpillBucket: props.bucket.bucketName,
        AthenaCatalogName: `${process.env.NODE_ENV}-athena-dynamo-query-function`,
        // Gotta love it, must be strings! :D
        LambdaTimeout: '900',
        LambdaMemory: '10000',
      },
    });
  }
}
