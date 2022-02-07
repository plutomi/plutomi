import * as dotenv from "dotenv";
import * as cdk from "@aws-cdk/core";
import * as sfn from "@aws-cdk/aws-stepfunctions";
import * as tasks from "@aws-cdk/aws-stepfunctions-tasks";
import { LogGroup } from "@aws-cdk/aws-logs";
import { Table } from "@aws-cdk/aws-dynamodb";
import {
  EMAILS,
  ENTITY_TYPES,
  API_URL,
  DOMAIN_NAME,
  WEBSITE_URL,
} from "../Config";

const resultDotEnv = dotenv.config({
  path: `${process.cwd()}/.env.${process.env.NODE_ENV}`,
});

if (resultDotEnv.error) {
  throw resultDotEnv.error;
}

interface DeletionMachineProps extends cdk.StackProps {
  table: Table;
}

/**
 * When an item is deleted, this deletes all children in the item or from other items.
 * For example: When deleting a question from an org this should delete the question from all stages.
 *
 * When deleting a stage, this should delete all applicants inside of it.
 *
 * When deleting an applicant, this should delete all files, notes, whatever else.
 *
 * When deleting an org, start at the top and start deleting everything. Etc. Etc.
 */
export default class DeletionMachineStack extends cdk.Stack {
  public DeletionMachine: sfn.StateMachine;
  /**
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */

  constructor(scope: cdk.App, id: string, props: DeletionMachineProps) {
    super(scope, id, props);

    const definition = new sfn.Choice(this, "WhichEntity?").when(
      sfn.Condition.stringEquals(
        "$.detail.NewImage.entityType",
        ENTITY_TYPES.QUESTION // TODO
      ),
      new sfn.Choice(this, "IsNewUser?")
    );

    const log = new LogGroup(
      this,
      `${process.env.NODE_ENV}-DeletionMachineLogGroup`
    );

    this.DeletionMachine = new sfn.StateMachine(this, "DeletionMachine", {
      stateMachineName: `${process.env.NODE_ENV}-DeletionMachine`,
      definition,
      timeout: cdk.Duration.minutes(5),
      stateMachineType: sfn.StateMachineType.EXPRESS,
      logs: {
        // Not enabled by default
        includeExecutionData: true,
        destination: log,
        level: sfn.LogLevel.ALL,
      },
    });
    props.table.grantWriteData(this.DeletionMachine); // TODO this event should just be update. No need for extra permissions
  }
}
