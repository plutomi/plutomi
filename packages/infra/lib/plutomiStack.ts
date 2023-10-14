import { type StackProps, Stack } from "aws-cdk-lib";
import type { Construct } from "constructs";

type PlutomiStackProps = StackProps;

export class PlutomiStack extends Stack {
  constructor(scope: Construct, id: string, props?: PlutomiStackProps) {
    super(scope, id, props);

    // TODO: Add stuff here :D
  }
}
