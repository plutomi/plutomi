import {
  UpdateCommand,
  UpdateCommandInput,
  PutCommand,
  PutCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { Dynamo } from "../../libs/ddbDocClient";
import { GetOpening } from "./getOpeningById";
const { DYNAMO_TABLE_NAME } = process.env;

<<<<<<< HEAD
// TODO update all properties of the opening
=======
>>>>>>> stage-reorder-patch
export default async function UpdateOpening({
  org_id,
  opening_id,
  updated_opening,
}) {
  const FORBIDDEN_KEYS = [
    "PK",
    "SK",
    "org_id",
    "entity_type",
    "created_at",
    "opening_id",
    "GSI1PK",
<<<<<<< HEAD
    // TODO if updating opening_name or GSI1SK, update the other  as well
=======
>>>>>>> stage-reorder-patch
  ];

  const incomingKeys = Object.keys(updated_opening);
  // TODO should this throw an error and
  // let the user know we can't update that key?
<<<<<<< HEAD
=======
  // Maybe just return in the message that we weren't able to update those keys
>>>>>>> stage-reorder-patch
  const newKeys = incomingKeys.filter((key) => !FORBIDDEN_KEYS.includes(key));

  // Build update expression
  let newUpdateExpression: string[] = [];
  let newAttributes: any = {};

  newKeys.forEach((key) => {
    newUpdateExpression.push(`${key} = :${key}`);
    newAttributes[`:${key}`] = updated_opening[key];
  });

  const UpdatedExpression = `SET ${newUpdateExpression.join(", ").toString()}`;

<<<<<<< HEAD
=======
  console.log("Updated opening", updated_opening);
>>>>>>> stage-reorder-patch
  console.log("Expression", UpdatedExpression);
  console.log("Attributes", newAttributes);

  const params = {
    Key: {
      PK: `ORG#${org_id}#OPENING#${opening_id}`,
      SK: `OPENING`,
    },
    UpdateExpression: UpdatedExpression,
    ExpressionAttributeValues: newAttributes,
    TableName: DYNAMO_TABLE_NAME,
    ConditionExpression: "attribute_exists(PK)",
  };

  try {
    await Dynamo.send(new UpdateCommand(params));
    return;
  } catch (error) {
    throw new Error(error);
  }
}
