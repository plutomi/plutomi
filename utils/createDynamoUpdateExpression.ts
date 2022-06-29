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

  for (const property of Object.keys(props.updatedValues)) {
    // Push each property into the update expression
    allUpdateExpressions.push(`${property} = :${property}`);

    // Create values for each attribute
    allAttributeValues[`:${property}`] = props.updatedValues[property];
  }

  return { allUpdateExpressions, allAttributeValues };
};
