import * as dotenv from "dotenv";
import * as cf from "@aws-cdk/aws-cloudfront";
import * as waf from "@aws-cdk/aws-wafv2";
import * as cdk from "@aws-cdk/core";
import * as iam from "@aws-cdk/aws-iam";
import * as ecs from "@aws-cdk/aws-ecs";
import * as protocol from "@aws-cdk/aws-elasticloadbalancingv2";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as route53 from "@aws-cdk/aws-route53";
import * as ecsPatterns from "@aws-cdk/aws-ecs-patterns";
import * as origins from "@aws-cdk/aws-cloudfront-origins";
import { Table } from "@aws-cdk/aws-dynamodb";
import { Certificate } from "@aws-cdk/aws-certificatemanager";
import { ARecord, RecordTarget } from "@aws-cdk/aws-route53";
import { CloudFrontTarget } from "@aws-cdk/aws-route53-targets";
import { API_DOMAIN, DOMAIN_NAME, EXPRESS_PORT } from "../Config";
import { Policy, PolicyStatement } from "@aws-cdk/aws-iam";
import * as sam from "@aws-cdk/aws-sam";
import * as s3 from "@aws-cdk/aws-s3";
import { DynamoActions } from "../types/main";
import { Duration } from "@aws-cdk/core";
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

    const AthenaDynamoQueryApplication = new sam.CfnApplication(
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
          LambdaTimeout: "900",
          LambdaMemory: "10000"
        },
      }
    );
  }
}
