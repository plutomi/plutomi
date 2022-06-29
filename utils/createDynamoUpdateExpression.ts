import * as Time from '../utils/time';

interface CreateDynamoUpdateExpressionProps {
  updatedValues: Object; // Any object
}

interface CreateDynamoUpdateExpressionResponse {
  allUpdateExpressions: string[];
  allAttributeValues: { [key: string]: string };
}

export const createDynamoUpdateExpression = (
  props: CreateDynamoUpdateExpressionProps,
): CreateDynamoUpdateExpressionResponse => {
  // Build update expression
  const allUpdateExpressions: string[] = [];
  const allAttributeValues: { [key: string]: string } = {};

  const updatedValuesWithDate = {
    ...props.updatedValues,
    updatedAt: Time.currentISO(),
  };

  for (const property of Object.keys(updatedValuesWithDate)) {
    // Push each property into the update expression
    allUpdateExpressions.push(`${property} = :${property}`);

    // Create values for each attribute
    allAttributeValues[`:${property}`] = updatedValuesWithDate[property];
  }

  return { allUpdateExpressions, allAttributeValues };
};
