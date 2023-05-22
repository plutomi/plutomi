import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import type { RequestHandler } from "express";
import { Schema, validate } from "@plutomi/validation";
import { env } from "../../utils";
import dayjs from "dayjs";

export const post: RequestHandler = async (req, res) => {
  const { data, errorHandled } = validate({
    req,
    res,
    schema: Schema.Subscribe.APISchema
  });

  if (errorHandled) {
    return;
  }

  const { email } = data;

  try {
    const now = dayjs();
    const nowIso = now.toISOString();
    await req.items.insertOne({
      _id: `WAIT_LIST_${email}`,
      createdAt: nowIso
    });
  } catch (error) {
    res.status(500).json({
      message: "An error ocurred adding you to our wait list!"
    });
  }

  const client = new DynamoDBClient({ region: "us-east-1" });
  const command = new PutItemCommand({
    TableName: `${env.DEPLOYMENT_ENVIRONMENT}-plutomi-wait-list`,
    Item: {
      PK: { S: email },
      SK: { S: email },
      email: { S: email },
      createdAt: { S: new Date().toISOString() }
    }
  });

  try {
    await client.send(command);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong signing you up" });
    return;
  }

  res.status(201).json({
    message:
      "Thanks for your interest! Make sure to check out Plutomi on GitHub!"
  });
};
