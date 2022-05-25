import { SNSClient } from '@aws-sdk/client-sns';

const SNSclient = new SNSClient({ region: 'us-east-1' });

export default SNSclient;
