import { RemovalPolicy, Stack } from "aws-cdk-lib";
import { Bucket, BucketEncryption, EventType } from "aws-cdk-lib/aws-s3";
import { Queue } from "aws-cdk-lib/aws-sqs";
import * as s3n from "aws-cdk-lib/aws-s3-notifications";

const assetsBucketName = `plutomi-assets-bucket`;

type CreateS3BucketProps = {
  stack: Stack;
  eventsQueue: Queue;
};

export const createS3Bucket = ({ stack, eventsQueue }: CreateS3BucketProps) => {
  const assetsBucket = new Bucket(stack, assetsBucketName, {
    bucketName: assetsBucketName,
    // Safeguard
    removalPolicy: RemovalPolicy.RETAIN,

    encryption: BucketEncryption.S3_MANAGED,
    enforceSSL: true,

    // This is false by default but setting explicitly
    publicReadAccess: false,
    versioned: true,
  });

  const sqsDestination = new s3n.SqsDestination(eventsQueue);

  [EventType.OBJECT_CREATED, EventType.OBJECT_REMOVED].forEach((event) => {
    assetsBucket.addEventNotification(event, sqsDestination);
  });

  return assetsBucket;
};
