import { DynamoExceptions } from '../awsClients/ddbDocClient';

const handleDynamoException = (e: typeof DynamoExceptions): string => {
  if (e.ConditionalCheckFailedException) {
    return 'Conditonal check failed';
  }

  if (e.TransactionCanceledException) {
    return 'Transaction failed';
  }

  if (e.DuplicateItemException) {
    return 'Item already exists';
  }

  if (e.IndexNotFoundException) {
    return 'Index not found';
  }

  if (e.ItemCollectionSizeLimitExceededException) {
    return 'Item collection size exceeded';
  }

  if (e.ResourceNotFoundException) {
    return 'Dynamo resource not found';
  }

  if (e.LimitExceededException) {
    return 'Dynamo limit exceeded';
  }

  if (e.TableNotFoundException) {
    return 'Table not found';
  }

  return 'An error ocurred with Dynamo';
};
