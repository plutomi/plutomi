import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { env } from "../utils/env";
import { configureSES } from "./configureSES";

export class PlutomiStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    configureSES({
      stack: this,
    });

    // ! TODO: S3 bucket
  }
}
