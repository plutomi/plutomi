import { RemovalPolicy, Stack } from "aws-cdk-lib";
import {
  Bucket,
  BucketEncryption,
  EventType,
  HttpMethods,
} from "aws-cdk-lib/aws-s3";
import { Queue } from "aws-cdk-lib/aws-sqs";
import { SqsDestination } from "aws-cdk-lib/aws-s3-notifications";
import { AnyPrincipal, Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { cloudflareIpv4, cloudflareIpv6 } from "../utils/cloudflareIps";
import { env } from "../utils/env";

// For allowing Cloudflare CNAME (ie assets.plutomi.com) to point to our S3 bucket for presigned urls
// https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html?icmpid=docs_amazons3_console
// https://stackoverflow.com/a/25817710
const assetsBucketName = `${
  env.NEXT_PUBLIC_ENVIRONMENT === "production"
    ? ""
    : `${env.NEXT_PUBLIC_ENVIRONMENT}-`
}assets.plutomi.com`;

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
    blockPublicAccess: {
      // https://stackoverflow.com/a/70473871
      // This is ON by default, and because of that it creates a DENY ALL policy by default
      // So just because it says it *is* public, you still have to explictly allow it per path / object
      blockPublicAcls: false,
      blockPublicPolicy: false,
      ignorePublicAcls: false,
      restrictPublicBuckets: false,
    },
    cors: [
      {
        allowedMethods: [HttpMethods.GET],
        allowedOrigins: ["plutomi.com", "*.plutomi.com"],
        allowedHeaders: ["*"],
      },
    ],
  });
  const sqsDestination = new SqsDestination(eventsQueue);
  // Send all object created and removed events to our events queue
  [EventType.OBJECT_CREATED, EventType.OBJECT_REMOVED].forEach((event) => {
    assetsBucket.addEventNotification(event, sqsDestination);
  });
  // Allow only Cloudflare to access the bucket in /public/*
  const cloudflarePolicyStatement = new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ["s3:GetObject"],
    resources: [assetsBucket.arnForObjects("public/*")],
    principals: [new AnyPrincipal()],
    conditions: {
      IpAddress: {
        "aws:SourceIp": [...cloudflareIpv4, ...cloudflareIpv6],
      },
    },
  });
  assetsBucket.addToResourcePolicy(cloudflarePolicyStatement);
  return assetsBucket;
};
