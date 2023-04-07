import { SESClient } from '@aws-sdk/client-ses';

export const SES = new SESClient({ region: 'us-east-1' });
