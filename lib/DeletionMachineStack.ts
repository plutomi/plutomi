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

    const ORG_DELETED = sfn.Condition.stringEquals(
      "$.detail.NewImage.entityType",
      ENTITY_TYPES.ORG
    );

    const QUESTION_DELETED = sfn.Condition.stringEquals(
      "$.detail.NewImage.entityType",
      ENTITY_TYPES.QUESTION
    );

    const OPENING_DELETED = sfn.Condition.stringEquals(
      "$.detail.NewImage.entityType",
      ENTITY_TYPES.OPENING
    );

    // TODO delete applcicants
    const STAGE_DELETED = sfn.Condition.stringEquals(
      "$.detail.NewImage.entityType",
      ENTITY_TYPES.STAGE
    );

    const GET_OPENINGS_SETTINGS = {
      service: "dynamodb",
      action: "query",
      iamResources: [
        `arn:aws:dynamodb:${this.region}:${this.account}:table/${props.table.tableName}`,
      ],
    };
    const GET_OPENINGS = new tasks.CallAwsService(this, "GetOpeningsCall", {
      ...GET_OPENINGS_SETTINGS,
      parameters: {
        TableName: props.table.tableName,
        IndexName: "GSI1",
        KeyConditionExpression: "GSI1PK = :GSI1PK",
        ExpressionAttributeValues: {
          ":GSI1PK.$": `States.Format('${ENTITY_TYPES.ORG}#{}#${ENTITY_TYPES.OPENING}S', $.detail.NewImage.orgId)`,
        },
      },
      resultPath: "$.DynamoDB",
    });
    /**
     * In parallel:
     * 1. Get all openings
     *  - Delete all openings
     * 2. Get all questions
     *  - Delete all questions
     *  TODO get all
     *
     */
    const definition = new sfn.Choice(this, "WhichEntity?").when(
      ORG_DELETED,
      new sfn.Parallel(this, "GetAllOrgItems").branch(GET_OPENINGS)
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
    // TODO
    props.table.grantWriteData(this.DeletionMachine); // TODO this event should just be update. No need for extra permissions
  }
}
