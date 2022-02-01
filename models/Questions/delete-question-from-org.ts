import { DeleteCommand, DeleteCommandInput } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../AWSClients/ddbDocClient";
import { ENTITY_TYPES } from "../../Config";
import { DeleteQuestionFromOrgInput } from "../../types/main";
const { DYNAMO_TABLE_NAME } = process.env;
import { SdkError } from "@aws-sdk/types";
export default async function DeleteQuestionFromOrg(
  props: DeleteQuestionFromOrgInput
): Promise<[null, null] | [null, SdkError]> {
  const { orgId, questionId } = props;

  // TODO this needs async processing to delete this question from stages that are using it!!!!!!!
  const params: DeleteCommandInput = {
    Key: {
      PK: `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.QUESTION}#${questionId}`,
      SK: ENTITY_TYPES.QUESTION,
    },
    TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
    ConditionExpression: "attribute_exists(PK)",
  };

  try {
    await Dynamo.send(new DeleteCommand(params));
    return [null, null];
  } catch (error) {
    return [null, error];
  }
}
