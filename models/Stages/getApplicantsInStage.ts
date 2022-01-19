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
    const { orgId, stageId, openingId } = props;
    const params: QueryCommandInput = {
      TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,

      IndexName: "GSI1",
      KeyConditionExpression: "GSI1PK = :GSI1PK",
      ExpressionAttributeValues: {
        ":GSI1PK": `${ENTITY_TYPES.ORG}#${orgId}#${ENTITY_TYPES.OPENING}#${openingId}#${ENTITY_TYPES.STAGE}#${stageId}`,
      },
      ScanIndexForward: false,
    };
    try {
      // TODO - Query until ALL items returned!
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
