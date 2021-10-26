import {
  TransactWriteCommand,
  TransactWriteCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../libs/ddbDocClient";
import { GetApplicantById } from "./getApplicantById";
const { DYNAMO_TABLE_NAME } = process.env;

export default async function DeleteApplicant({ org_id, applicant_id }) {
  const applicant = (await GetApplicantById({
    org_id,
    applicant_id,
  })) as DynamoApplicant;
  try {
    const transactParams: TransactWriteCommandInput = {
      TransactItems: [
        {
          // Delete the applicant
          Delete: {
            Key: {
              PK: `ORG#${org_id}#APPLICANT#${applicant_id}`,
              SK: `APPLICANT`,
            },
            TableName: DYNAMO_TABLE_NAME,
            ConditionExpression: "attribute_exists(PK)",
          },
        },

        {
          // Remove applicant from opening's total_applicants
          Update: {
            Key: {
              PK: `ORG#${org_id}#OPENING#${applicant.current_opening_id}`, // todo fix types
              SK: `OPENING`,
            },
            TableName: DYNAMO_TABLE_NAME,
            UpdateExpression:
              "SET total_applicants = total_applicants - :value",
            ExpressionAttributeValues: {
              ":value": 1,
            },
          },
        },
        {
          // Remove applicant from stage's total_applicants
          Update: {
            Key: {
              PK: `ORG#${org_id}#STAGE#${applicant.current_stage_id}`, // todo fix types
              SK: `STAGE`,
            },
            TableName: DYNAMO_TABLE_NAME,
            UpdateExpression:
              "SET total_applicants = total_applicants - :value",
            ExpressionAttributeValues: {
              ":value": 1,
            },
          },
        },
        {
          // Remove applicant to the orgs total_applicants
          Update: {
            Key: {
              PK: `ORG#${org_id}`,
              SK: `ORG`,
            },
            TableName: DYNAMO_TABLE_NAME,
            UpdateExpression:
              "SET total_applicants = total_applicants - :value",
            ExpressionAttributeValues: {
              ":value": 1,
            },
          },
        },
      ],
    };

    await Dynamo.send(new TransactWriteCommand(transactParams));
  } catch (error) {
    console.error(error);
    throw new Error(`Unable to delete applicant ${error}`);
  }
}
