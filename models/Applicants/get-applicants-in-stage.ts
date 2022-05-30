import { QueryCommandInput, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { SdkError } from '@aws-sdk/types';
import { Dynamo } from '../../awsClients/ddbDocClient';
import { DYNAMO_TABLE_NAME, Entities } from '../../Config';
import { GetApplicantsInStageInput, GetApplicantsInStageOutput } from '../../types/main';

export default async function GetApplicants(
  props: GetApplicantsInStageInput,
): Promise<[GetApplicantsInStageOutput, null] | [null, SdkError]> {
  const { orgId, stageId, openingId } = props;

  const params: QueryCommandInput = {
    TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :GSI1PK',
    ExpressionAttributeValues: {
      ':GSI1PK': `${Entities.ORG}#${orgId}#${Entities.OPENING}#${openingId}#${Entities.STAGE}#${stageId}`,
    },
    ScanIndexForward: false,
  };
  try {
    // TODO - Query until ALL items returned!
    const response = await Dynamo.send(new QueryCommand(params));
    const allApplicants = response.Items as GetApplicantsInStageOutput;

    return [allApplicants, null];
  } catch (error) {
    return [null, error];
  }
}
