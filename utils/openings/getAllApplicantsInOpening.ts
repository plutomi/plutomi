import { QueryCommand, QueryCommandInput } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
const { DYNAMO_TABLE_NAME } = process.env;

export async function GetAllApplicantsInOpening({ orgId, openingId }) {
  const params: QueryCommandInput = {
    TableName: DYNAMO_TABLE_NAME,
    IndexName: "GSI1",
    KeyConditionExpression:
      "GSI1PK = :GSI1PK AND  begins_with(GSI1SK, :GSI1SK)",
    ExpressionAttributeValues: {
      ":GSI1PK": `ORG#${orgId}#APPLICANTS`,
      ":GSI1SK": `OPENING#${openingId}`,
    },
  };

  try {
    // TODO - MAJOR!
    // Query until ALL items returned! Even though applicants are "split up" in a sense
    // That meaning, files, notes, etc are different items in Dynamo
    // The result might (and probably will!) be large enough that it might not be returned in one query
    const response = await Dynamo.send(new QueryCommand(params));
    const all_applicants = response.Items;

    // Sort by full name, or whatever else, probably most recently active would be best
    all_applicants.sort((a, b) => (a.fullName < b.fullName ? 1 : -1));

    return all_applicants;
  } catch (error) {
    throw new Error(error);
  }
}
