/**
 *  Given a record from an SQS queue which went through DynamoDB streams
 *  this will return the baseline item, parsed and ready to use
 * @param SQSEventRecord
 */
export const parse = (SQSEventRecord) => {
  const item = JSON.parse(JSON.parse(SQSEventRecord.body).Message).dynamodb;

  return item;
};
