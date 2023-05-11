import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import type { RequestHandler } from "express";
import { Schemas } from "@plutomi/validation";
import { zParse } from "../../utils";

export const post: RequestHandler = async (req, res) => {
  const { body } = await zParse(Schemas.Subscribe.APISchema, req, res);
  const { email } = body;

  const client = new DynamoDBClient({ region: "us-east-1" });
  const command = new PutItemCommand({
    TableName: "plutomi-mvp",
    Item: {
      PK: { S: email },
      SK: { S: email },
      email: { S: email },
      createdAt: { S: new Date().toISOString() }
    }
  });

  try {
    const results = await client.send(command);
    console.log(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong signing you up :(" });
    return;
  }

  res.status(201).json({
    message:
      "Thanks for your interest! Make sure to check out Plutomi on GitHub!"
  });
};
