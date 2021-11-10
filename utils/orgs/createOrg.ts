import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../lib/awsClients/ddbDocClient";
import { getCurrentTime } from "../time";

const { DYNAMO_TABLE_NAME } = process.env;

export async function CreateOrg({ orgId, GSI1SK }: CreateOrgInput) {
  const now = getCurrentTime("iso") as string;
  const new_org = {
    PK: `ORG#${orgId}`,
    SK: `ORG`,
    orgId: orgId, // plutomi - Cannot be changed
    entityType: "ORG",
    created_at: now,
    total_applicants: 0,
    total_openings: 0,
    total_stages: 0,
    total_users: 0,
    GSI1PK: `ORG`, // Allows for 'get all orgs' query
    // but cannot do get org by specific name as there might be duplicates
    GSI1SK: GSI1SK, // Actual org name ie: Plutomi Inc - Can be changed!
  };

  const params: PutCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    Item: new_org,
    ConditionExpression: "attribute_not_exists(PK)",
  };

  try {
    await Dynamo.send(new PutCommand(params));
    return new_org;
  } catch (error) {
    if (error.name == "ConditionalCheckFailedException") {
      throw new Error(
        `The organization name '${orgId}' has already been taken :(`
      );
    }
    throw new Error(error);
  }
}
