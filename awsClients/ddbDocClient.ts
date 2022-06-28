import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { ddbClient } from './ddbClient';

import {
  FailureException,
  TableInUseException,
  ExportConflictException,
  ExportNotFoundException,
  BackupInUseException,
  LimitExceededException,
  DuplicateItemException,
  IndexNotFoundException,
  ResourceInUseException,
  TableNotFoundException,
  BackupNotFoundException,
  InvalidEndpointException,
  ReplicaNotFoundException,
  ResourceNotFoundException,
  InvalidExportTimeException,
  TableAlreadyExistsException,
  InvalidRestoreTimeException,
  GlobalTableNotFoundException,
  TransactionCanceledException,
  TransactionConflictException,
  ReplicaAlreadyExistsException,
  TransactionInProgressException,
  ConditionalCheckFailedException,
  ItemCollectionSizeLimitExceededException,
  PointInTimeRecoveryUnavailableException,
  ProvisionedThroughputExceededException,
  ContinuousBackupsUnavailableException,
  IdempotentParameterMismatchException,
  GlobalTableAlreadyExistsException,
} from '@aws-sdk/client-dynamodb/dist-types';

const marshallOptions = {
  // Whether to automatically convert empty strings, blobs, and sets to `null`.
  convertEmptyValues: false, // false, by default.
  // Whether to remove undefined values while marshalling.
  removeUndefinedValues: false, // false, by default.
  // Whether to convert typeof object to map attribute.
  convertClassInstanceToMap: false, // false, by default.
};

const unmarshallOptions = {
  // Whether to return numbers as a string instead of converting them to native JavaScript numbers.
  wrapNumbers: false, // false, by default.
};

const translateConfig = { marshallOptions, unmarshallOptions };

// Create the DynamoDB Document client.
const Dynamo = DynamoDBDocumentClient.from(ddbClient, translateConfig);

const DynamoExceptions = {
  FailureException,
  TableInUseException,
  ExportConflictException,
  ExportNotFoundException,
  BackupInUseException,
  LimitExceededException,
  DuplicateItemException,
  IndexNotFoundException,
  ResourceInUseException,
  TableNotFoundException,
  BackupNotFoundException,
  InvalidEndpointException,
  ReplicaNotFoundException,
  ResourceNotFoundException,
  InvalidExportTimeException,
  TableAlreadyExistsException,
  InvalidRestoreTimeException,
  GlobalTableNotFoundException,
  TransactionCanceledException,
  TransactionConflictException,
  ReplicaAlreadyExistsException,
  TransactionInProgressException,
  ConditionalCheckFailedException,
  ItemCollectionSizeLimitExceededException,
  PointInTimeRecoveryUnavailableException,
  ProvisionedThroughputExceededException,
  ContinuousBackupsUnavailableException,
  IdempotentParameterMismatchException,
  GlobalTableAlreadyExistsException,
};
export { Dynamo, DynamoExceptions };
