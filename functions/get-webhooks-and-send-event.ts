import { StepFunctionsInvokeActivity } from '@aws-cdk/aws-stepfunctions-tasks';
import { EventBridgeEvent } from 'aws-lambda';
import { Entities } from '../Config';
import { DynamoApplicant } from '../types/dynamo';

const obj = {
  eventName: 'INSERT',
  NewImage: {
    lastName: 'aasd',
    canReceiveEmails: true,
    entityType: 'APPLICANT',
    openingId: '8FpOarWNsOan7Id',
    isEmailVerified: false,
    orgId: 'a',
    createdAt: '2022-05-30T08:05:44.074Z',
    firstName: 'aa',
    GSI1PK: 'ORG#a#OPENING#8FpOarWNsOan7Id#STAGE#Wx_hqA2AXKW13En',
    GSI1SK: 'DATE_LANDED#2022-05-30T08:05:44.074Z',
    SK: 'APPLICANT',
    PK: 'ORG#a#APPLICANT#mQUJdGC-rOZdVXMMqqRUlri866ibl8kPnM4',
    applicantId: 'mQUJdGC-rOZdVXMMqqRUlri866ibl8kPnM4',
    unsubscribeKey: 'E1inVUxWcq',
    email: 'contact+aojsidasojid@josevalerio.com',
    stageId: 'Wx_hqA2AXKW13En',
  },
  PK: 'ORG#a#APPLICANT#mQUJdGC-rOZdVXMMqqRUlri866ibl8kPnM4',
  SK: 'a',
  entityType: 'APPLICANT',
  orgId: 'a',
};

interface ApplicantWebhookEvent {
  NewImage?: DynamoApplicant;
  OldImage?: DynamoApplicant;
  PK: `${Entities.ORG}#${string}#${Entities.APPLICANT}#${string}`;
  SK: string;
  entityType: Entities.APPLICANT;
  orgId: string;
}

export async function main(event: EventBridgeEvent<'stream', ApplicantWebhookEvent>) {
  console.log('IN WEBHOOKS SENDING FUNCTION');
  console.log(JSON.stringify(event));

  return;
}
