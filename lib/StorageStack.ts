import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { envVars } from '../env';

export default class StorageStack extends cdk.Stack {
  public readonly bucket: s3.Bucket;

  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.bucket = new s3.Bucket(
      this,
      `${envVars.NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT}-plutomi-assets`,
      {
        enforceSSL: true,
        blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
        bucketName: `${envVars.NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT}-plutomi-assets`,
        versioned: true,
      },
    );
  }
}
