import { Dynamo } from "../../libs/ddbDocClient";
import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import { nanoid } from "nanoid";
import { GetCurrentTime } from "../time";
import { JoinOrg } from "../users/joinOrg";
const { DYNAMO_TABLE_NAME } = process.env;
/**
 *
 * @param org_name
 * @param user_info
 */

export async function CreateOrg(org_name: string, user_info: UserSession) {
  if (user_info.org_join_date != "NO_ORG_ASSIGNED") {
    throw new Error(`You already belong to an org`);
  }

  // TODO check if user belongs to an org already
  const now = GetCurrentTime("iso");
  const org_id = nanoid(30);
  const new_org = {
    PK: `ORG#${org_id}`,
    SK: `ORG`,
    org_name: org_name,
    entity_type: "ORG",
    created_at: now,
    GSI1PK: `ORG`, // No need to add an extra index, can query from here to get all orgs!
    GSI1SK: `ORG#${org_id}`,
  };

  const params: PutCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    Item: new_org,
  };

  try {
    await Dynamo.send(new PutCommand(params));

    try {
      await JoinOrg(user_info.user_id, org_id);
    } catch (error) {
      throw new Error(
        `We were able to create your organization, however you were unable to be added to it. ${error}`
      );
    }
    return new_org;
  } catch (error) {
    throw new Error(error);
  }
}
