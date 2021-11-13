import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { GetCurrentTime } from "../time";

const { DYNAMO_TABLE_NAME } = process.env;

export async function createOrg({ orgId, GSI1SK }) {
  const now = GetCurrentTime("iso") as string;
  const newOrg = {
    PK: `ORG#${orgId}`,
    SK: `ORG`,
    orgId: orgId, // plutomi - Cannot be changed
    entityType: "ORG",
    createdAt: now,
    totalApplicants: 0,
    totalOpenings: 0,
    totalStages: 0,
    totalUsers: 0,
    GSI1PK: `ORG`, // Allows for 'get all orgs' query
    // but cannot do get org by specific name as there might be duplicates
    GSI1SK: GSI1SK, // Actual org name ie: Plutomi Inc - Can be changed!
  };

  const params: PutCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    Item: newOrg,
    ConditionExpression: "attribute_not_exists(PK)",
  };

  try {
    await Dynamo.send(new PutCommand(params));
    return newOrg;
  } catch (error) {
    if (error.name == "ConditionalCheckFailedException") {
      throw new Error(
        `The organization name '${orgId}' has already been taken :(`
      );
    }
    throw new Error(error);
  }
}
