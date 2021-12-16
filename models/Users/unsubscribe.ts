import { PutCommandInput, PutCommand } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { ENTITY_TYPES, TIME_UNITS } from "../../Config";
import { DynamoNewLoginLink } from "../../types/dynamo";
import { CreateLoginLinkInput } from "../../types/main";
const { DYNAMO_TABLE_NAME } = process.env;
import * as Time from "../../utils/time";
import { SdkError } from "@aws-sdk/types";

export default async function unsubscribe(
  props
): Promise<[null, null] | [null, SdkError]> {
  const { email } = props;
  const now = Time.currentISO();
  try {
    const unsubscribeEvent = {
      PK: `UNSUBSCRIBED#${email}`,
      SK: now,
      entityType: "UNSUBSCRIBE",
      createdAt: now,
    };

    const params: PutCommandInput = {
      TableName: DYNAMO_TABLE_NAME,
      Item: unsubscribeEvent,
      ConditionExpression: "attribute_not_exists(PK)",
    };

    await Dynamo.send(new PutCommand(params));
    return [null, null];
  } catch (error) {
    return [null, error];
  }
}
