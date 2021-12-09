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
  CreateStageQuestionInput,
  DeleteApplicantInput,
  DeleteQuestionInput,
  GetApplicantByIdInput,
  GetApplicantByIdOutput,
  GetQuestionInput,
  GetQuestionOutput,
  UpdateApplicantInput,
  UpdateQuestionInput,
} from "../types/main";
import {
  DynamoNewApplicant,
  DynamoNewApplicantResponse,
  DynamoNewStageQuestion,
} from "../types/dynamo";
import _ from "lodash";
const { DYNAMO_TABLE_NAME } = process.env;

export const createQuestion = async (
  props: CreateStageQuestionInput
): Promise<void> => {
  const { orgId, stageId, GSI1SK, questionDescription } = props;
  const now = Time.currentISO();
  const questionId = nanoid(ID_LENGTHS.STAGE_QUESTION);
  const newStageQuestion: DynamoNewStageQuestion = {
    PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.STAGE_QUESTION}#${questionId}`,
    SK: ENTITY_TYPES.STAGE_QUESTION,
    questionDescription: questionDescription || "",
    questionId: questionId,
    entityType: ENTITY_TYPES.STAGE_QUESTION,
    createdAt: now,
    GSI1PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.STAGE}#${stageId}#QUESTIONS`,
    GSI1SK: GSI1SK,
    orgId: orgId,
    stageId: stageId,
  };

  try {
    let stage = await getStageById({ orgId, stageId });

    if (stage.questionOrder.length >= LIMITS.MAX_CHILD_ENTITY_LIMIT) {
      throw ERRORS.MAX_CHILD_ENTITY_LIMIT_ERROR_MESSAGE;
    }

    try {
      stage.questionOrder.push(questionId);

      const transactParams: TransactWriteCommandInput = {
        TransactItems: [
          {
            // Add question
            Put: {
              Item: newStageQuestion,
              TableName: DYNAMO_TABLE_NAME,
            },
          },
          {
            // Add question to question order
            Update: {
              Key: {
                PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.STAGE}#${stageId}`,
                SK: ENTITY_TYPES.STAGE,
              },
              TableName: DYNAMO_TABLE_NAME,
              UpdateExpression: "SET questionOrder = :questionOrder",
              ExpressionAttributeValues: {
                ":questionOrder": stage.questionOrder,
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
  } catch (error) {
    throw new Error(
      `Unable to retrieve stage where question should be added ${error}` // TODO add to errors
    );
  }
};

export const deleteQuestion = async (
  props: DeleteQuestionInput
): Promise<void> => {
  const { orgId, questionId } = props;
  // Delete the question item & update the question order on the stage
  try {
    let question = await getQuestionById({ orgId, questionId });
    // TODO this shouldnt be here!!!
    let stage = await getStageById({ orgId, stageId: question.stageId });
    const deletedQuestionIndex = stage.questionOrder.indexOf(questionId);

    // Update question order
    stage.questionOrder.splice(deletedQuestionIndex, 1);

    const transactParams: TransactWriteCommandInput = {
      TransactItems: [
        {
          // Delete question
          Delete: {
            Key: {
              PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.STAGE_QUESTION}#${questionId}`,
              SK: ENTITY_TYPES.STAGE_QUESTION,
            },
            TableName: DYNAMO_TABLE_NAME,
          },
        },
        {
          // Update Question Order
          Update: {
            Key: {
              PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.STAGE}#${stage.stageId}`,
              SK: ENTITY_TYPES.STAGE,
            },
            TableName: DYNAMO_TABLE_NAME,
            UpdateExpression: "SET questionOrder = :questionOrder",
            ExpressionAttributeValues: {
              ":questionOrder": stage.questionOrder,
            },
          },
        },
      ],
    };

    try {
      await Dynamo.send(new TransactWriteCommand(transactParams));

      return;
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  } catch (error) {
    console.error(error);
    throw Error(`Unable to retrieve stage to delete question ${error}`);
  }
};

export const getQuestionById = async (
  props: GetQuestionInput
): Promise<GetQuestionOutput> => {
  const { orgId, questionId } = props;
  const params: GetCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    Key: {
      PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.STAGE_QUESTION}#${questionId}`,
      SK: ENTITY_TYPES.STAGE_QUESTION,
    },
  };

  try {
    const response = await Dynamo.send(new GetCommand(params));
    return response.Item as GetQuestionOutput;
  } catch (error) {
    throw new Error(error);
  }
};

export const updateQuestion = async (
  props: UpdateQuestionInput
): Promise<void> => {
  const { orgId, questionId, newQuestionValues } = props;
  // Build update expression
  let allUpdateExpressions: string[] = [];
  let allAttributeValues: any = {};

  // Filter out forbidden property
  for (const property in newQuestionValues) {
    if (FORBIDDEN_PROPERTIES.STAGE_QUESTION.includes(property)) {
      // Delete the property so it isn't updated
      delete newQuestionValues[property];
    }

    // If its a valid property, start creating the new update expression
    // Push each property into the update expression
    allUpdateExpressions.push(`${property} = :${property}`);

    // Create values for each attribute
    allAttributeValues[`:${property}`] = newQuestionValues[property];
  }

  const params = {
    Key: {
      PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.STAGE_QUESTION}#${questionId}`,
      SK: ENTITY_TYPES.STAGE_QUESTION,
    },
    UpdateExpression: `SET ` + allUpdateExpressions.join(", "),
    ExpressionAttributeValues: allAttributeValues,
    TableName: DYNAMO_TABLE_NAME,
    ConditionExpression: "attribute_exists(PK)",
  };

  try {
    await Dynamo.send(new UpdateCommand(params));
    return;
  } catch (error) {
    throw new Error(error);
  }
};
