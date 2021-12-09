import {
  GetCommand,
  GetCommandInput,
  PutCommand,
  PutCommandInput,
  QueryCommand,
  QueryCommandInput,
  TransactWriteCommand,
  TransactWriteCommandInput,
  UpdateCommand,
  UpdateCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../awsClients/ddbDocClient";
import * as Time from "../utils/time";
import { nanoid } from "nanoid";
import { ENTITY_TYPES, FORBIDDEN_PROPERTIES, ID_LENGTHS } from "../Config";
import {
  CreateApplicantInput,
  CreateApplicantOutput,
  CreateApplicantResponseInput,
  CreateApplicantResponseOutput,
  CreateOpeningInput,
  DeleteApplicantInput,
  DeleteOpeningInput,
  GetApplicantByIdInput,
  GetApplicantByIdOutput,
  GetOpeningByIdInput,
  UpdateApplicantInput,
} from "../types/main";
import {
  DynamoNewApplicant,
  DynamoNewApplicantResponse,
  DynamoNewOpening,
} from "../types/dynamo";
import _ from "lodash";
import { deleteStage } from "../utils/stages/deleteStage";
const { DYNAMO_TABLE_NAME } = process.env;

export const getOpeningById = async (
  props: GetOpeningByIdInput
): Promise<DynamoNewOpening> => {
  const { orgId, openingId } = props;
  const params: GetCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    Key: {
      PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.OPENING}#${openingId}`,
      SK: ENTITY_TYPES.OPENING,
    },
  };

  try {
    const response = await Dynamo.send(new GetCommand(params));
    return response.Item as DynamoNewOpening;
  } catch (error) {
    throw new Error(error);
  }
};

export const createOpening = async (
  props: CreateOpeningInput
): Promise<DynamoNewOpening> => {
  const { orgId, GSI1SK } = props;
  const openingId = nanoid(ID_LENGTHS.OPENING);
  const newOpening: DynamoNewOpening = {
    PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.OPENING}#${openingId}`,
    SK: ENTITY_TYPES.OPENING,
    entityType: ENTITY_TYPES.OPENING,
    createdAt: Time.currentISO(),
    orgId: orgId,
    openingId: openingId,
    GSI1PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.OPENING}S`,
    GSI1SK: GSI1SK,
    totalStages: 0,
    totalApplicants: 0,
    isPublic: false,
    stageOrder: [],
  };

  const transactParams: TransactWriteCommandInput = {
    TransactItems: [
      {
        // Create the opening
        Put: {
          Item: newOpening,
          TableName: DYNAMO_TABLE_NAME,
          ConditionExpression: "attribute_not_exists(PK)",
        },
      },
      {
        // Increment the org's total openings
        Update: {
          Key: {
            PK: `${ENTITY_TYPES.ORG}#${orgId}`,
            SK: ENTITY_TYPES.ORG,
          },
          TableName: DYNAMO_TABLE_NAME,
          UpdateExpression:
            "SET totalOpenings = if_not_exists(totalOpenings, :zero) + :value",
          ExpressionAttributeValues: {
            ":zero": 0,
            ":value": 1,
          },
        },
      },
    ],
  };

  try {
    await Dynamo.send(new TransactWriteCommand(transactParams));
    return newOpening;
  } catch (error) {
    throw new Error(error);
  }
};

export const deleteOpening = async (
  props: DeleteOpeningInput
): Promise<void> => {
  const { orgId, openingId } = props;
  // TODO we should not be doing this here!!!
  const allStages = await getAllStagesInOpening({ orgId, openingId }); // TODO we dont have to query this anymore!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

  try {
    // Delete stages first
    if (allStages.length) {
      allStages.map(async (stage) => {
        // TODO add to SQS & delete applicants, rules, questions, etc.
        const input = {
          orgId: orgId,
          openingId: openingId,
          stageId: stage.stageId,
        };
        await deleteStage(input); // TODO we should not be doing this her
      });
    }

    console.log("Deleting funnel");

    const transactParams: TransactWriteCommandInput = {
      TransactItems: [
        {
          // Delete the opening
          Delete: {
            Key: {
              PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.OPENING}#${openingId}`,
              SK: ENTITY_TYPES.OPENING,
            },
            TableName: DYNAMO_TABLE_NAME,
          },
        },
        {
          // Decrement the org's total openings
          Update: {
            Key: {
              PK: `${ENTITY_TYPES.ORG}#${orgId}`,
              SK: ENTITY_TYPES.ORG,
            },
            TableName: DYNAMO_TABLE_NAME,
            UpdateExpression: "SET totalOpenings = totalOpenings - :value",
            ExpressionAttributeValues: {
              ":value": 1,
            },
          },
        },
      ],
    };

    await Dynamo.send(new TransactWriteCommand(transactParams));
    return;
  } catch (error) {
    throw new Error(error);
  }
};
