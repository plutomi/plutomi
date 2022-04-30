import { SQSClient } from '@aws-sdk/client-sqs';

const SQSclient = new SQSClient({ region: 'us-east-1' });

export default SQSclient;
