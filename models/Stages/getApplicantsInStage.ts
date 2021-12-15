import { QueryCommandInput, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../awsClients/ddbDocClient";
import { ENTITY_TYPES } from "../../Config";
import {
  GetAllApplicantsInStageInput,
  GetAllApplicantsInStageOutput,
} from "../../types/main";
const { DYNAMO_TABLE_NAME } = process.env;
import { SdkError } from "@aws-sdk/types";
export default async function GetApplicants(
  props: GetAllApplicantsInStageInput
): Promise<[GetAllApplicantsInStageOutput, null] | [null, SdkError]> {
  {
    const { orgId, stageId } = props;
    const params: QueryCommandInput = {
      TableName: DYNAMO_TABLE_NAME,
      IndexName: "GSI2",
      KeyConditionExpression:
        "GSI2PK = :GSI2PK AND  begins_with(GSI2SK, :GSI2SK)",
      ExpressionAttributeValues: {
        ":GSI2PK": `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.APPLICANT}S`,
        ":GSI2SK": `${ENTITY_TYPES.STAGE}#${stageId}`,
      },
    };

    try {
      // TODO - MAJOR!
      // Query until ALL items returned! Even though applicants are "split up" in a sense
      // That meaning, files, notes, etc are different items in Dynamo
      // The result might (and probably will!) be large enough that it might not be returned in one query
      const response = await Dynamo.send(new QueryCommand(params));
      const allApplicants = response.Items as GetAllApplicantsInStageOutput;

      // Sort by full name, or whatever else, probably most recently active would be best
      allApplicants.sort((a, b) => (a.fullName < b.fullName ? 1 : -1));

      return [allApplicants, null];
    } catch (error) {
      return [null, error];
    }
  }
}
