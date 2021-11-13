import { QueryCommand, QueryCommandInput } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
const { DYNAMO_TABLE_NAME } = process.env;

export async function GetAllApplicantsInStage({ orgId, stageId }) {
  const params: QueryCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    IndexName: "GSI2",
    KeyConditionExpression:
      "GSI2PK = :GSI2PK AND  begins_with(GSI2SK, :GSI2SK)",
    ExpressionAttributeValues: {
      ":GSI2PK": `ORG#${orgId}#APPLICANTS`,
      ":GSI2SK": `STAGE#${stageId}`,
    },
  };

  try {
    // TODO - MAJOR!
    // Query until ALL items returned! Even though applicants are "split up" in a sense
    // That meaning, files, notes, etc are different items in Dynamo
    // The result might (and probably will!) be large enough that it might not be returned in one query
    const response = await Dynamo.send(new QueryCommand(params));
    const allApplicants = response.Items;

    // Sort by full name, or whatever else, probably most recently active would be best
    allApplicants.sort((a, b) => (a.fullName < b.fullName ? 1 : -1));

    return allApplicants;
  } catch (error) {
    throw new Error(error);
  }
}
