import { DeleteCommand, DeleteCommandInput } from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../libs/ddbDocClient";
const { DYNAMO_TABLE_NAME } = process.env;

export default async function DeleteApplicant({ org_id, applicant_id }) {
  try {
    const params: DeleteCommandInput = {
      TableName: DYNAMO_TABLE_NAME,
      Key: {
        PK: `ORG#${org_id}#APPLICANT#${applicant_id}`,
        SK: `APPLICANT`,
      },
    };

    await Dynamo.send(new DeleteCommand(params));
    return;
  } catch (error) {
    throw new Error(`Unable to delete applicant ${error}`);
  }
}
