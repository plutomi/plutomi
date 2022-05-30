import { TransactWriteCommandInput, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import { SdkError } from '@aws-sdk/types';
import { Dynamo } from '../../awsClients/ddbDocClient';
import { DYNAMO_TABLE_NAME, Entities } from '../../Config';
import { DeleteApplicantInput } from '../../types/main';

export default async function Remove(
  props: DeleteApplicantInput,
): Promise<[null, null] | [null, SdkError]> {
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
            TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,
          },
        },

        {
          // Decrement opening's totalApplicants
          Update: {
            Key: {
              PK: `${Entities.ORG}#${orgId}#${Entities.OPENING}#${openingId}`,
              SK: Entities.OPENING,
            },
            TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,

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
            TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,

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
            TableName: `${process.env.NODE_ENV}-${DYNAMO_TABLE_NAME}`,

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
}
