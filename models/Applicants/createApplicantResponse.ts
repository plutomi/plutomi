import { PutCommandInput, PutCommand } from '@aws-sdk/lib-dynamodb';
import { nanoid } from 'nanoid';
import { Dynamo } from '../../awsClients/ddbDocClient';
import { ID_LENGTHS, Entities, DYNAMO_TABLE_NAME } from '../../Config';
import { env } from '../../env';
import { DynamoApplicantResponse } from '../../types/dynamo';
import * as Time from '../../utils/time';

type CreateApplicantResponseInput = Pick<
  DynamoApplicantResponse,
  'orgId' | 'applicantId' | 'questionTitle' | 'description' | 'questionResponse'
>;

export const createApplicantResponse = async (
  props: CreateApplicantResponseInput,
): Promise<[DynamoApplicantResponse, null] | [null, any]> => {
  const { orgId, applicantId, questionTitle, description, questionResponse } = props;
  const responseId = nanoid(ID_LENGTHS.APPLICANT_RESPONSE);

  const now = Time.currentISO();
  const newApplicantResponse: DynamoApplicantResponse = {
    PK: `${Entities.ORG}#${orgId}#${Entities.APPLICANT}#${applicantId}`,
    SK: `${Entities.APPLICANT_RESPONSE}#${responseId}`,
    orgId,
    applicantId,
    entityType: Entities.APPLICANT_RESPONSE,
    createdAt: now,
    updatedAt: now,
    responseId,
    questionTitle,
    description,
    questionResponse,
    GSI1PK: `${Entities.ORG}#${orgId}#${Entities.APPLICANT}#${applicantId}`,
    GSI1SK: Entities.APPLICANT_RESPONSE, // TODO add timestmap?
  };

  const params: PutCommandInput = {
    TableName: `${env.deploymentEnvironment}-${DYNAMO_TABLE_NAME}`,
    Item: newApplicantResponse,
    ConditionExpression: 'attribute_not_exists(PK)',
  };

  try {
    await Dynamo.send(new PutCommand(params));
    return [newApplicantResponse, null];
  } catch (error) {
    return [null, error];
  }
};
