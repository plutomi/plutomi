import {
  TransactWriteCommand,
  TransactWriteCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../AWSClients/ddbDocClient";
import { DYNAMO_TABLE_NAME, ENTITY_TYPES } from "../../Config";
import { DeleteQuestionFromOrgInput } from "../../types/main";
import { SdkError } from "@aws-sdk/types";

export default async function DeleteQuestionFromOrg(
  props: DeleteQuestionFromOrgInput
): Promise<[null, null] | [null, SdkError]> {
  const { orgId, questionId } = props;

  const transactParams: TransactWriteCommandInput = {
    TransactItems: [
      {
        // Delete question from org
        Delete: {
          Key: {
            PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.QUESTION}#${questionId}`,
            SK: ENTITY_TYPES.QUESTION,
          },
          TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
          ConditionExpression: "attribute_exists(PK)",
        },
      },
      {
        // Decrement the org's totalQuestions
        Update: {
          Key: {
            PK: `${ENTITY_TYPES.ORG}#${orgId}`,
            SK: ENTITY_TYPES.ORG,
          },
          TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
          UpdateExpression: "SET totalQuestions = totalQuestions - :value",
          ExpressionAttributeValues: {
            ":value": 1,
          },
        },
      },
    ],
  };
  try {
    await Dynamo.send(new TransactWriteCommand(transactParams));
    return [null, null];
  } catch (error) {
    return [null, error];
  }
}
