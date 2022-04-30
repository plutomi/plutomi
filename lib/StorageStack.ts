import * as cdk from "@aws-cdk/core";
import * as s3 from "@aws-cdk/aws-s3";

export default class StorageStack extends cdk.Stack {
  public readonly bucket: s3.Bucket;
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.bucket = new s3.Bucket(
      this,
      `${process.env.NODE_ENV}-plutomi-assets`,
      {
        enforceSSL: true,
        blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
        bucketName: `${process.env.NODE_ENV}-plutomi-assets`,
        versioned: true,
      }
    );
  }
}
