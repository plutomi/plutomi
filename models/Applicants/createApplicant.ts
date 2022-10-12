import { TransactWriteCommandInput, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import { nanoid } from 'nanoid';
import { Dynamo } from '../../awsClients/ddbDocClient';
import { FailureException } from '@aws-sdk/client-dynamodb';

import { ID_LENGTHS, Entities, OpeningState, DYNAMO_TABLE_NAME } from '../../Config';
import { DynamoApplicant } from '../../types/dynamo';
import * as Time from '../../utils/time';
import { env } from '../../env';

export type CreateApplicantInput = Pick<
  DynamoApplicant,
  'orgId' | 'firstName' | 'lastName' | 'email' | 'openingId' | 'stageId'
>;

export const createApplicant = async (
  props: CreateApplicantInput,
): Promise<[DynamoApplicant, null] | [null, FailureException]> => {
  const { orgId, firstName, lastName, email, openingId, stageId } = props;

  const now = Time.currentISO();
  const applicantId = nanoid(ID_LENGTHS.APPLICANT);

  const newApplicant: DynamoApplicant = {
    PK: `${Entities.ORG}#${orgId}#${Entities.APPLICANT}#${applicantId}`,
    SK: Entities.APPLICANT,
    firstName,
    lastName,
    email: email.toLowerCase().trim(),
    isEmailVerified: false,
    orgId,
    applicantId,
    applicantData: {},
    entityType: Entities.APPLICANT,
    createdAt: now,
    updatedAt: now,
    // TODO add phone number
    openingId,
    stageId,
    unsubscribeKey: nanoid(10),
    canReceiveEmails: true,
    GSI1PK: `${Entities.ORG}#${orgId}#${Entities.OPENING}#${openingId}#${Entities.STAGE}#${stageId}`,
    GSI1SK: `DATE_LANDED#${now}`,
    // TODO add another GSI here for getting all applications by email
    // Fulfills searching easily and for the applicant portal
  };

  try {
    const transactParams: TransactWriteCommandInput = {
      TransactItems: [
        {
          // Add an applicant item
          Put: {
            Item: newApplicant,
            TableName: `${env.deploymentEnvironment}-${DYNAMO_TABLE_NAME}`,

            ConditionExpression: 'attribute_not_exists(PK)',
          },
        },
        {
          // Increment the opening's totalApplicants
          Update: {
            Key: {
              PK: `${Entities.ORG}#${orgId}#${Entities.OPENING}#${openingId}`,
              SK: Entities.OPENING,
            },
            TableName: `${env.deploymentEnvironment}-${DYNAMO_TABLE_NAME}`,

            UpdateExpression:
              'SET totalApplicants = if_not_exists(totalApplicants, :zero) + :value',
            /**
             * Opening must exist, be public, & must have stages
             * Since this is a transaction, this whole thing will fail if this check fails
             */
            ConditionExpression:
              'attribute_exists(PK) AND GSI1SK = :GSI1SK AND totalStages > :totalStages',
            ExpressionAttributeValues: {
              ':zero': 0,
              ':value': 1,
              ':GSI1SK': OpeningState.PUBLIC,
              ':totalStages': 0,
            },
          },
        },
        {
          // Increment the stage's total applicants
          Update: {
            Key: {
              PK: `${Entities.ORG}#${orgId}#${Entities.OPENING}#${openingId}#${Entities.STAGE}#${stageId}`,
              SK: Entities.STAGE,
            },
            TableName: `${env.deploymentEnvironment}-${DYNAMO_TABLE_NAME}`,

            ConditionExpression: 'attribute_exists(PK)',
            UpdateExpression:
              'SET totalApplicants = if_not_exists(totalApplicants, :zero) + :value',
            ExpressionAttributeValues: {
              ':zero': 0,
              ':value': 1,
            },
          },
        },
        {
          // Increment the org's total applicants
          Update: {
            Key: {
              PK: `${Entities.ORG}#${orgId}`,
              SK: Entities.ORG,
            },
            TableName: `${env.deploymentEnvironment}-${DYNAMO_TABLE_NAME}`,

            ConditionExpression: 'attribute_exists(PK)',
            UpdateExpression:
              'SET totalApplicants = if_not_exists(totalApplicants, :zero) + :value',
            ExpressionAttributeValues: {
              ':zero': 0,
              ':value': 1,
            },
          },
        },
      ],
    };

    await Dynamo.send(new TransactWriteCommand(transactParams));
    return [newApplicant, null];
  } catch (error) {
    return [null, error];
  }
};
