import { QueryCommandInput, QueryCommand } from '@aws-sdk/lib-dynamodb';
import _ from 'lodash';
import { SdkError } from '@aws-sdk/types';
import { Dynamo } from '../../awsClients/ddbDocClient';
import { DYNAMO_TABLE_NAME, Entities } from '../../Config';
import { GetApplicantByIdInput, GetApplicantByIdOutput } from '../../types/main';
import { DynamoApplicant } from '../../types/dynamo';

export default async function GetApplicantById(
  props: GetApplicantByIdInput,
): Promise<[GetApplicantByIdOutput, null] | [null, SdkError]> {
  const { orgId, applicantId } = props;
  const responsesParams: QueryCommandInput = {
    TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
    KeyConditionExpression: 'PK = :PK',
    ExpressionAttributeValues: {
      ':PK': `${Entities.ORG}#${orgId}#${Entities.APPLICANT}#${applicantId}`,
    },
  };

  try {
    // TODO refactor for promise all / transact
    const allApplicantInfo = await Dynamo.send(new QueryCommand(responsesParams));

    if (allApplicantInfo.Count === 0) {
      throw new Error('Applicant not found');
    }

    if (allApplicantInfo?.Items?.length === 0) {
      throw new Error('Applicant not found');
    }

    const grouped = _.groupBy(allApplicantInfo.Items, 'entityType');

    const metadata = grouped.APPLICANT[0] as DynamoApplicant;
    const responses = grouped.APPLICANT_RESPONSE;
    // TODO files

    const applicant: GetApplicantByIdOutput = {
      ...metadata,
      responses,
      // TODO files
    };
    return [applicant, null]; // TODO TYPEs!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  } catch (error) {
    return [null, error];
  }
}
