import { Dynamo } from "../../libs/ddbDocClient";
import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import { nanoid } from "nanoid";
import { GetCurrentTime } from "../time";
import { JoinOrg } from "../users/joinOrg";
const { DYNAMO_TABLE_NAME } = process.env;
/**
 *
 * @param org_id
 * @param user_info
 */

export async function CreateOrg({ org_id, org_name, user }: CreateOrgInput) {
  const now = GetCurrentTime("iso");
  const new_org = {
    PK: `ORG#${org_id}`,
    SK: `ORG`,
    org_id: org_id, // plutomi
    org_name: org_name, // Plutomi Inc.
    entity_type: "ORG",
    created_at: now,
    GSI1PK: `ORG`, // Allows for 'get all orgs' query
    GSI1SK: `ORG#${org_id}`,
  };

  const params: PutCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    Item: new_org,
    ConditionExpression: "attribute_not_exists(PK)",
  };

  // TODO convert this into a transact?
  // try {
  //   await Dynamo.send(new PutCommand(params));

  //   try {
  //     await JoinOrg(user_info.user_id, org_id);
  //   } catch (error) {
  //     // TODO handle re-trying to join if possible
  //     // Delete the org and try again, or do a transacrt write
  //     // Create & Join org
  //     throw new Error(
  //       `We were able to create your organization, however you were unable to be added to it. ${error}`
  //     );
  //   }
  //   return new_org;
  // } catch (error) {
  //   throw new Error(error);
  // }

  try {
    await Dynamo.send(new PutCommand(params));
    return new_org;
  } catch (error) {
    if (error.name == "ConditionalCheckFailedException") {
      throw new Error(
        `The organization name '${org_id}' has already been taken :(`
      );
    }
    throw new Error(error);
  }
}
