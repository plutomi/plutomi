import type { RequestHandler } from "express";
import { createJoinedAggregation, getDbName } from "../../utils";
import { AllEntityNames, Email, RelatedToType } from "@plutomi/shared";

export const get: RequestHandler = async (req, res) => {
  await req.items.deleteMany({});
  await req.items.deleteMany({});
  await req.items.deleteMany({});
  await req.items.deleteMany({});
  await req.items.deleteMany({});
  await req.items.deleteMany({});

  const userId = "user_9510";
  const user = await req.items.insertOne({
    _id: userId,
    entityType: AllEntityNames.USER,
    firstName: "asdasd",
    lastName: "asdasd",
    emailVerified: false,
    emailVerifiedAt: null,
    canReceiveEmails: true,
    email: "adasd@sda.com",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    relatedTo: [
      {
        id: userId,
        type: RelatedToType.SELF
      },
      {
        id: "emailasdasdasd" as Email,
        type: RelatedToType.USERS
      }
    ]
  });

  const notes = Array.from({ length: 10 }).map((_, i) => ({
    _id: `note_${i}`,
    entityType: AllEntityNames.NOTE,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    relatedTo: [
      {
        id: `note_${i}`,
        type: RelatedToType.SELF
      },
      {
        id: userId,
        type: RelatedToType.NOTES
      }
    ]
  }));

  const files = Array.from({ length: 5 }).map((_, i) => ({
    _id: `file_${i}`,
    entityType: AllEntityNames.FILE,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    relatedTo: [
      {
        id: `file_${i}`,
        type: RelatedToType.SELF
      },
      {
        id: userId,
        type: RelatedToType.FILES
      }
    ]
  }));

  await req.items.insertMany([user, ...notes, ...files]);

  try {
    const x = await req.items
      .aggregate(
        createJoinedAggregation({
          id: userId,
          entitiesToRetrieve: [
            {
              entityType: RelatedToType.SELF,
              entityName: AllEntityNames.USER
            },
            {
              entityType: RelatedToType.NOTES,
              entityName: AllEntityNames.NOTE
            },
            {
              entityType: RelatedToType.FILES,
              entityName: AllEntityNames.FILE
            }
          ],
          rootItem: AllEntityNames.USER
        })
      )
      .toArray();

    res.send(x[0]);
  } catch (error) {
    console.error(error);
    res.send(error);
  }
  // try {
  //   const result = await req.client.db(getDbName()).command({ ping: 1 });
  //   res.status(200).json({
  //     message: "Saul Goodman",
  //     db: result
  //   });
  // } catch (error) {
  //   res.status(500).json({ message: "Error connecting to MongoDB!", error });
  // }
};
