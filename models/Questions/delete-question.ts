import {
  TransactWriteCommandInput,
  TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../AWSClients/ddbDocClient";
import { ENTITY_TYPES } from "../../Config";
import { DeleteQuestionInput } from "../../types/main";
const { DYNAMO_TABLE_NAME } = process.env;
import { SdkError } from "@aws-sdk/types";
export default async function DeleteQuestion(
  props: DeleteQuestionInput
): Promise<[null, null] | [null, SdkError]> {
  const { orgId, questionId, stageId, questionOrder, deletedQuestionIndex } =
    props;

  // Update question order
  questionOrder.splice(deletedQuestionIndex, 1);

  const transactParams: TransactWriteCommandInput = {
    TransactItems: [
      {
        // Delete question
        Delete: {
          Key: {
            PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.QUESTION}#${questionId}`,
            SK: ENTITY_TYPES.QUESTION,
          },
          TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
        },
      },
      {
        // Update Question Order
        Update: {
          Key: {
            PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.STAGE}#${stageId}`,
            SK: ENTITY_TYPES.STAGE,
          },
          TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,

          UpdateExpression: "SET questionOrder = :questionOrder",
          ExpressionAttributeValues: {
            ":questionOrder": questionOrder,
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
