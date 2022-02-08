import * as dotenv from "dotenv";
import * as cdk from "@aws-cdk/core";
import * as sfn from "@aws-cdk/aws-stepfunctions";
import * as tasks from "@aws-cdk/aws-stepfunctions-tasks";
import { LogGroup, RetentionDays } from "@aws-cdk/aws-logs";
import { Table } from "@aws-cdk/aws-dynamodb";
import { ENTITY_TYPES } from "../Config";

const resultDotEnv = dotenv.config({
  path: `${process.cwd()}/.env.${process.env.NODE_ENV}`,
});

if (resultDotEnv.error) {
  throw resultDotEnv.error;
}

interface DeleteChildrenMachineProps extends cdk.StackProps {
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
export default class DeleteChildrenMachineStack extends cdk.Stack {
  public DeleteChildrenMachine: sfn.StateMachine;
  /**
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */

  constructor(scope: cdk.App, id: string, props: DeleteChildrenMachineProps) {
    super(scope, id, props);
    const DYNAMO_QUERY_SETTINGS = {
      service: "dynamodb",
      action: "query",
      iamResources: [
        props.table.tableArn,
        props.table.tableArn + "/index/GSI1",
        props.table.tableArn + "/index/GSI2",
      ],
    };

    /**
     * When an OPENING is deleted,
     * delete all stages for it
     */
    const OPENING_DELETED = sfn.Condition.stringEquals(
      "$.detail.OldImage.entityType",
      ENTITY_TYPES.OPENING
    );

    const GET_STAGES_IN_OPENING = new tasks.CallAwsService(
      this,
      "GetStagesInOpening",
      {
        ...DYNAMO_QUERY_SETTINGS,
        parameters: {
          TableName: props.table.tableName,
          IndexName: "GSI1",
          KeyConditionExpression: "GSI1PK = :GSI1PK",
          ExpressionAttributeValues: {
            ":GSI1PK": {
              "S.$": `States.Format('${ENTITY_TYPES.ORG}#{}#${ENTITY_TYPES.OPENING}#{}#${ENTITY_TYPES.STAGE}S', $.detail.OldImage.orgId, $.detail.OldImage.openingId)`,
            },
          },
        },
        resultSelector: {
          "stages.$": "$.Items",
        },
      }
    );

    const DeleteStagesMap = new sfn.Map(this, "DeleteStagesInOpeningMap", {
      maxConcurrency: 1,
      inputPath: "$[0].stages", // Map converts this to an array for some reason
      parameters: {
        // Makes it easier to get these attributes per item
        "PK.$": `States.Format('${ENTITY_TYPES.ORG}#{}#${ENTITY_TYPES.OPENING}#{}#${ENTITY_TYPES.STAGE}#{}', $$.Map.Item.Value.orgId.S, $$.Map.Item.Value.openingId.S, $$.Map.Item.Value.stageId.S)`,
        SK: ENTITY_TYPES.STAGE,
      },
    });
    DeleteStagesMap.iterator(
      new tasks.DynamoDeleteItem(this, "DeleteStagesInOpening", {
        table: props.table,
        key: {
          PK: tasks.DynamoAttributeValue.fromString(
            sfn.JsonPath.stringAt("$.PK")
          ),
          SK: tasks.DynamoAttributeValue.fromString(
            sfn.JsonPath.stringAt("$.SK")
          ),
        },
      })
    );
    // ------------------------------------------------------------
    /**
     *  When an ORG is deleted
     *  Delete all openings inside the org [ ]
     *  Delete all questions inside the org [ ]
     *
     */
    const ORG_DELETED = sfn.Condition.stringEquals(
      "$.detail.OldImage.entityType",
      ENTITY_TYPES.ORG
    );

    const GET_OPENINGS_IN_ORG = new tasks.CallAwsService(
      this,
      "GetOpeningsInOrg",
      {
        ...DYNAMO_QUERY_SETTINGS,
        parameters: {
          TableName: props.table.tableName,
          IndexName: "GSI1",
          KeyConditionExpression: "GSI1PK = :GSI1PK",
          ExpressionAttributeValues: {
            ":GSI1PK": {
              "S.$": `States.Format('${ENTITY_TYPES.ORG}#{}#${ENTITY_TYPES.OPENING}S', $.detail.OldImage.orgId)`,
            },
          },
        },
        resultSelector: {
          "openings.$": "$.Items",
        },
      }
    );

    const DeleteOpeningsMap = new sfn.Map(this, "DeleteOpeningsInOrgMap", {
      maxConcurrency: 1,
      inputPath: "$.openings",
      parameters: {
        // Makes it easier to get these attributes per item
        "PK.$": `States.Format('${ENTITY_TYPES.ORG}#{}#${ENTITY_TYPES.OPENING}#{}', $$.Map.Item.Value.orgId.S, $$.Map.Item.Value.openingId.S)`,
        SK: ENTITY_TYPES.OPENING,
      },
    });
    DeleteOpeningsMap.iterator(
      new tasks.DynamoDeleteItem(this, "DeleteOpeningsInOrg", {
        table: props.table,
        key: {
          PK: tasks.DynamoAttributeValue.fromString(
            sfn.JsonPath.stringAt("$.PK")
          ),
          SK: tasks.DynamoAttributeValue.fromString(
            sfn.JsonPath.stringAt("$.SK")
          ),
        },
      })
    );
    const QUESTION_DELETED = sfn.Condition.stringEquals(
      "$.detail.OldImage.entityType",
      ENTITY_TYPES.QUESTION
    );

    const STAGE_DELETED = sfn.Condition.stringEquals(
      "$.detail.OldImage.entityType",
      ENTITY_TYPES.STAGE
    );

    const definition = new sfn.Choice(this, "WhichEntity?")
      .when(OPENING_DELETED, GET_STAGES_IN_OPENING.next(DeleteStagesMap))
      .when(ORG_DELETED, GET_OPENINGS_IN_ORG.next(DeleteOpeningsMap))
      .otherwise(new sfn.Succeed(this, "No entity match - TODO remove"));

    // ----- State Machine Settings -----
    const log = new LogGroup(
      this,
      `${process.env.NODE_ENV}-DeleteChildrenMachineLogGroup`,
      {
        retention: RetentionDays.ONE_MONTH,
      }
    );

    this.DeleteChildrenMachine = new sfn.StateMachine(
      this,
      "DeleteChildrenMachine",
      {
        stateMachineName: `${process.env.NODE_ENV}-DeleteChildrenMachine`,
        definition,
        timeout: cdk.Duration.minutes(5),
        stateMachineType: sfn.StateMachineType.EXPRESS,
        logs: {
          // Not enabled by default
          includeExecutionData: true,
          destination: log,
          level: sfn.LogLevel.ALL,
        },
      }
    );
    // TODO
    props.table.grantWriteData(this.DeleteChildrenMachine); // TODO this event should just be update. No need for extra permissions
  }
}
