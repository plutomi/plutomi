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
import {
  ENTITY_TYPES,
  ERRORS,
  FORBIDDEN_PROPERTIES,
  ID_LENGTHS,
  LIMITS,
} from "../Config";
import {
  CreateApplicantInput,
  CreateApplicantOutput,
  CreateApplicantResponseInput,
  CreateApplicantResponseOutput,
  CreateStageInput,
  DeleteApplicantInput,
  DeleteStageInput,
  GetAllApplicantsInStageInput,
  GetAllApplicantsInStageOutput,
  GetApplicantByIdInput,
  GetApplicantByIdOutput,
  GetStageByIdInput,
  GetStageByIdOutput,
  UpdateApplicantInput,
  UpdateStageInput,
} from "../types/main";
import {
  DynamoNewApplicant,
  DynamoNewApplicantResponse,
  DynamoNewStage,
} from "../types/dynamo";
import _ from "lodash";
const { DYNAMO_TABLE_NAME } = process.env;

export const createStage = async (props: CreateStageInput): Promise<void> => {
  const { orgId, GSI1SK, openingId } = props;
  const stageId = nanoid(ID_LENGTHS.STAGE);
  const newStage: DynamoNewStage = {
    // TODO fix this type
    PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.STAGE}#${stageId}`,
    SK: ENTITY_TYPES.STAGE,
    entityType: ENTITY_TYPES.STAGE,
    createdAt: Time.currentISO(),
    questionOrder: [],
    stageId: stageId,
    orgId: orgId,
    totalApplicants: 0,
    openingId: openingId,
    GSI1PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.OPENING}#${openingId}#STAGES`, // Get all stages in an opening
    GSI1SK: GSI1SK,
  };

  try {
    // TODO this should not be here, this should be in controller
    let opening = await getOpening({ orgId, openingId });

    try {
      // Get current opening
      opening.stageOrder.push(stageId);

      if (opening.stageOrder.length >= LIMITS.MAX_CHILD_ENTITY_LIMIT) {
        throw ERRORS.MAX_CHILD_ENTITY_LIMIT_ERROR_MESSAGE;
      }

      const transactParams: TransactWriteCommandInput = {
        TransactItems: [
          {
            // Add a stage item
            Put: {
              Item: newStage,
              TableName: DYNAMO_TABLE_NAME,
              ConditionExpression: "attribute_not_exists(PK)",
            },
          },

          {
            // Add stage to the opening + increment stage count on opening
            Update: {
              Key: {
                PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.OPENING}#${openingId}`,
                SK: ENTITY_TYPES.OPENING,
              },
              TableName: DYNAMO_TABLE_NAME,

              UpdateExpression:
                "SET stageOrder = :stageOrder, totalStages = if_not_exists(totalStages, :zero) + :value",
              ExpressionAttributeValues: {
                ":stageOrder": opening.stageOrder,
                ":zero": 0,
                ":value": 1,
              },
            },
          },
          {
            // Increment stage count on org
            Update: {
              Key: {
                PK: `${ENTITY_TYPES.ORG}#${orgId}`,
                SK: ENTITY_TYPES.ORG,
              },
              TableName: DYNAMO_TABLE_NAME,
              UpdateExpression:
                "SET totalStages = if_not_exists(totalStages, :zero) + :value",
              ExpressionAttributeValues: {
                ":zero": 0,
                ":value": 1,
              },
            },
          },
        ],
      };

      await Dynamo.send(new TransactWriteCommand(transactParams));
      return;
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  } catch (error) {
    throw new Error(
      `Unable to retrieve opening where stage should be added ${error}` // TODO add to errors
    );
  }
};

// TODO check if stage is empt of appliants first
// TODO delete stage from the funnels sort order
export const deleteStage = async (props: DeleteStageInput): Promise<void> => {
  const { orgId, stageId } = props;
  // TODO Qeuery all items that start with PK: stageId & SK: ${ENTITY_TYPES.STAGE}
  // Get the opening we need to update
  try {
    let stage = await getStageById({ orgId, stageId });
    // TODO this should not be here, this should be in controller
    let opening = await getOpening({
      orgId: orgId,
      openingId: stage.openingId,
    });

    // Set the new stage order
    let newStageOrder = opening.stageOrder.filter(
      (id: string) => id !== stageId
    );
    opening.stageOrder = newStageOrder;

    // Delete the stage item & update the stage order on the opening
    const transactParams: TransactWriteCommandInput = {
      TransactItems: [
        {
          // Delete stage
          Delete: {
            Key: {
              PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.STAGE}#${stageId}`,
              SK: ENTITY_TYPES.STAGE,
            },
            TableName: DYNAMO_TABLE_NAME,
          },
        },
        {
          // Update Stage Order
          Update: {
            Key: {
              PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.OPENING}#${opening.openingId}`,
              SK: ENTITY_TYPES.OPENING,
            },
            TableName: DYNAMO_TABLE_NAME,
            ConditionExpression: "attribute_exists(PK)",
            UpdateExpression: "SET stageOrder = :stageOrder",
            ExpressionAttributeValues: {
              ":stageOrder": opening.stageOrder,
            },
          },
        },

        {
          // Decrement stage count on org
          Update: {
            Key: {
              PK: `${ENTITY_TYPES.ORG}#${orgId}`,
              SK: ENTITY_TYPES.ORG,
            },
            TableName: DYNAMO_TABLE_NAME,
            UpdateExpression: "SET totalStages = totalStages - :value",
            ExpressionAttributeValues: {
              ":value": 1,
            },
          },
        },
      ],
    };

    try {
      await Dynamo.send(new TransactWriteCommand(transactParams));
      // TODO Qeuery all items that start with PK: stageId & SK: ${ENTITY_TYPES.STAGE}
      // Maybe background processes can handle this instead
      return;
    } catch (error) {
      throw new Error(error);
    }
  } catch (error) {
    console.error(error);
    throw Error(`Unable to retrieve opening to delete stage ${error}`); // TODO add to errors
  }
};

export const updateStage = async (props: UpdateStageInput): Promise<void> => {
  const { orgId, stageId, newStageValues } = props;

  // Build update expression
  let allUpdateExpressions: string[] = [];
  let allAttributeValues: any = {};

  // Filter out forbidden property
  for (const property in newStageValues) {
    if (FORBIDDEN_PROPERTIES.STAGE.includes(property)) {
      // Delete the property so it isn't updated
      delete newStageValues[property];
    }

    // If its a valid property, start creating the new update expression
    // Push each property into the update expression
    allUpdateExpressions.push(`${property} = :${property}`);

    // Create values for each attribute
    allAttributeValues[`:${property}`] = newStageValues[property];
  }

  const params = {
    Key: {
      PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.STAGE}#${stageId}`,
      SK: ENTITY_TYPES.STAGE,
    },
    UpdateExpression: `SET ` + allUpdateExpressions.join(", "),
    ExpressionAttributeValues: allAttributeValues,
    TableName: DYNAMO_TABLE_NAME,
    ConditionExpression: "attribute_exists(PK)",
  };

  try {
    await Dynamo.send(new UpdateCommand(params));
  } catch (error) {
    throw new Error(error);
  }
};

/**
 * Returns a stage by its ID.
 * @param props {@link GetStageByIdInput}
 * @returns - {@link GetStageByIdOutput}
 */
export const getStageById = async (
  props: GetStageByIdInput
): Promise<GetStageByIdOutput> => {
  const { orgId, stageId } = props;
  const params: GetCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    Key: {
      PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.STAGE}#${stageId}`,
      SK: ENTITY_TYPES.STAGE,
    },
  };

  try {
    const response = await Dynamo.send(new GetCommand(params));
    return response.Item as GetStageByIdOutput;
  } catch (error) {
    throw new Error(error);
  }
};

export const getAllApplicantsInStage = async (
  props: GetAllApplicantsInStageInput
): Promise<GetAllApplicantsInStageOutput> => {
  const { orgId, stageId } = props;
  const params: QueryCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    IndexName: "GSI2",
    KeyConditionExpression:
      "GSI2PK = :GSI2PK AND  begins_with(GSI2SK, :GSI2SK)",
    ExpressionAttributeValues: {
      ":GSI2PK": `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.APPLICANT}S`,
      ":GSI2SK": `${ENTITY_TYPES.STAGE}#${stageId}`,
    },
  };

  try {
    // TODO - MAJOR!
    // Query until ALL items returned! Even though applicants are "split up" in a sense
    // That meaning, files, notes, etc are different items in Dynamo
    // The result might (and probably will!) be large enough that it might not be returned in one query
    const response = await Dynamo.send(new QueryCommand(params));
    const allApplicants = response.Items as GetAllApplicantsInStageOutput;

    // Sort by full name, or whatever else, probably most recently active would be best
    allApplicants.sort((a, b) => (a.fullName < b.fullName ? 1 : -1));

    return allApplicants;
  } catch (error) {
    throw new Error(error);
  }
};
