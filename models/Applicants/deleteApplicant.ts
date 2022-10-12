import { TransactWriteCommandInput, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import { Dynamo } from '../../awsClients/ddbDocClient';
import { DYNAMO_TABLE_NAME, Entities } from '../../Config';
import { env } from '../../env';
import { DynamoApplicant } from '../../types/dynamo';

export type DeleteApplicantInput = Pick<
  DynamoApplicant,
  'orgId' | 'applicantId' | 'openingId' | 'stageId' // Last two are needed to decrement the applicant count
>;

export const deleteApplicant = async (
  props: DeleteApplicantInput,
): Promise<[null, null] | [null, any]> => {
  const { orgId, applicantId, openingId, stageId } = props;
  try {
    const transactParams: TransactWriteCommandInput = {
      TransactItems: [
        {
          // Delete the applicant
          Delete: {
            Key: {
              PK: `${Entities.ORG}#${orgId}#${Entities.APPLICANT}#${applicantId}`,
              SK: Entities.APPLICANT,
            },
            TableName: `${env.deploymentEnvironment}-${DYNAMO_TABLE_NAME}`,
          },
        },
        {
          // Decrement opening's totalApplicants
          Update: {
            Key: {
              PK: `${Entities.ORG}#${orgId}#${Entities.OPENING}#${openingId}`,
              SK: Entities.OPENING,
            },
            TableName: `${env.deploymentEnvironment}-${DYNAMO_TABLE_NAME}`,
            UpdateExpression: 'SET totalApplicants = totalApplicants - :value',
            ExpressionAttributeValues: {
              ':value': 1,
            },
          },
        },
        {
          // Decrement stage's totalApplicants
          Update: {
            Key: {
              PK: `${Entities.ORG}#${orgId}#${Entities.STAGE}#${stageId}`,
              SK: Entities.STAGE,
            },
            TableName: `${env.deploymentEnvironment}-${DYNAMO_TABLE_NAME}`,
            UpdateExpression: 'SET totalApplicants = totalApplicants - :value',
            ExpressionAttributeValues: {
              ':value': 1,
            },
          },
        },
        {
          // Decrement the org's total applicants
          Update: {
            Key: {
              PK: `${Entities.ORG}#${orgId}`,
              SK: Entities.ORG,
            },
            TableName: `${env.deploymentEnvironment}-${DYNAMO_TABLE_NAME}`,
            UpdateExpression: 'SET totalApplicants = totalApplicants - :value',
            ExpressionAttributeValues: {
              ':value': 1,
            },
          },
        },
      ],
    };

    await Dynamo.send(new TransactWriteCommand(transactParams));
    return [null, null];
  } catch (error) {
    return [null, error];
  }
};
