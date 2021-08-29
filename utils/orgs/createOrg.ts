import { Dynamo } from "../../libs/ddbDocClient";
import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import { nanoid } from "nanoid";
import { GetCurrentTime } from "../time";
import { JoinOrg } from "../users/joinOrg";
const { DYNAMO_TABLE_NAME } = process.env;
/**
 *
 * @param org_url_name
 * @param user_info
 */

export async function CreateOrg({
  org_url_name,
  org_official_name,
}: CreateOrgInput) {
  // if (user_info.org_join_date != "NO_ORG_ASSIGNED")
  //   throw new Error(`You already belong to an org`);

  const now = GetCurrentTime("iso");
  const new_org = {
    PK: `ORG#${org_url_name}`,
    SK: `ORG`,
    org_url_name: org_url_name, // plutomi
    org_official_name: org_official_name, // Plutomi Inc.
    entity_type: "ORG",
    created_at: now,
    GSI1PK: `ORG`, // Allows for 'get all orgs' query
    GSI1SK: `ORG#${org_url_name}`,
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
  //     await JoinOrg(user_info.user_id, org_url_name);
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
        `The organization name '${org_url_name}' has already been taken :(`
      );
    }
    throw new Error(error);
  }
}
