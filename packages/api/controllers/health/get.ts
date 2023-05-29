import type { RequestHandler } from "express";
import { createJoinedAggregation } from "../../utils";
import {
  AllEntityNames,
  Email,
  RelatedToType,
  User,
  randomItemFromArray,
  randomNumberInclusive
} from "@plutomi/shared";

export const get: RequestHandler = async (req, res) => {
  await req.items.deleteMany({});
  await req.items.deleteMany({});
  await req.items.deleteMany({});
  await req.items.deleteMany({});
  await req.items.deleteMany({});
  await req.items.deleteMany({});

  const users = Array.from({ length: randomNumberInclusive(10000, 10000) }).map(
    (_, i) => {
      const userId = `user_${i}`;
      return {
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
      };
    }
  );

  const randomUser = randomItemFromArray(users);

  const notes = Array.from({ length: randomNumberInclusive(5, 100) }).map(
    (_, i) => ({
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
          id: randomUser._id,
          type: RelatedToType.NOTES
        }
      ]
    })
  );

  const files = Array.from({ length: randomNumberInclusive(5, 100) }).map(
    (_, i) => ({
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
          id: randomUser._id,
          type: RelatedToType.FILES
        }
      ]
    })
  );

  const memberships = Array.from({ length: randomNumberInclusive(5, 100) }).map(
    (_, i) => ({
      _id: `memberships_${i}`,
      entityType: AllEntityNames.MEMBERSHIP,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      relatedTo: [
        {
          id: `memberships_${i}`,
          type: RelatedToType.SELF
        },
        {
          id: randomUser._id,
          type: RelatedToType.MEMBERSHIPS
        }
      ]
    })
  );

  const invites = Array.from({ length: randomNumberInclusive(5, 100) }).map(
    (_, i) => ({
      _id: `invites_${i}`,
      entityType: AllEntityNames.INVITE,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      relatedTo: [
        {
          id: `invites_${i}`,
          type: RelatedToType.SELF
        },
        {
          id: randomUser._id,
          type: RelatedToType.INVITES
        }
      ]
    })
  );

  const tasks = Array.from({ length: randomNumberInclusive(5, 100) }).map(
    (_, i) => ({
      _id: `tasks_${i}`,
      entityType: AllEntityNames.TASK,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      relatedTo: [
        {
          id: `tasks_${i}`,
          type: RelatedToType.SELF
        },
        {
          id: randomUser._id,
          type: RelatedToType.TASKS
        }
      ]
    })
  );

  console.log(`rANDOM USER ID`, randomUser._id);
  await req.items.insertMany([
    ...users,
    ...notes,
    ...files,
    ...memberships,
    ...invites,
    ...tasks
  ]);

  const aggregationd = createJoinedAggregation({
    id: randomUser._id,
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
    ]
  });
  // res.send(aggregationd);
  // return;

  // console.log(`GGAREGA`, aggregationd);
  // res.send(aggregationd);
  // return;
  try {
    const x = await req.items.aggregate<User>(aggregationd).toArray();

    const userDat: User | null = x[0];
    console.log(`USERDATA`, userDat);

    if (!userDat) {
      res.status(404).send("User not found");
      return;
    }
    res.send(userDat);
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
