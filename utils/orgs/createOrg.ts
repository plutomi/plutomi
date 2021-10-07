import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../libs/ddbDocClient";
import { GetCurrentTime } from "../time";

const { DYNAMO_TABLE_NAME } = process.env;

export async function CreateOrg({ org_id, GSI1SK, user }: CreateOrgInput) {
  const now = GetCurrentTime("iso");
  // TODO add created by with user
  const new_org = {
    PK: `ORG#${org_id.toLowerCase()}`,
    SK: `ORG`,
    org_id: org_id, // plutomi - Cannot be changed
    entity_type: "ORG",
    created_at: now,
    GSI1PK: `ORG`, // Allows for 'get all orgs' query
    // but cannot do get org by specific name as there might be duplicates
    GSI1SK: GSI1SK, // Actual org name ie: Plutomi Inc - Can be changed!
  };

  const params: PutCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    Item: new_org,
    ConditionExpression: "attribute_not_exists(PK)",
  };

  // TODO JOIN ORG AS A TRANSACTION!!!
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
