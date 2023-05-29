import type { RequestHandler } from "express";
import {
  AllEntityNames,
  RelatedToType,
  type Email,
  type User,
  randomItemFromArray,
  randomNumberInclusive
} from "@plutomi/shared";
import { createJoinedAggregation } from "../createJoinedAggregation";
import { generatePlutomiId } from "../../generatePlutomiId";

export const get: RequestHandler = async (req, res) => {
  await req.items.deleteMany({});
  await req.items.deleteMany({});
  await req.items.deleteMany({});
  await req.items.deleteMany({});
  await req.items.deleteMany({});
  await req.items.deleteMany({});
  await req.items.deleteMany({});
  await req.items.deleteMany({});
  await req.items.deleteMany({});
  await req.items.deleteMany({});
  await req.items.deleteMany({});
  await req.items.deleteMany({});
  await req.items.deleteMany({});
  await req.items.deleteMany({});
  await req.items.deleteMany({});
  await req.items.deleteMany({});
  await req.items.deleteMany({});
  await req.items.deleteMany({});
  await req.items.deleteMany({});
  await req.items.deleteMany({});
  await req.items.deleteMany({});
  await req.items.deleteMany({});
  await req.items.deleteMany({});
  await req.items.deleteMany({});
  await req.items.deleteMany({});
  await req.items.deleteMany({});
  await req.items.deleteMany({});
  await req.items.deleteMany({});
  await req.items.deleteMany({});
  await req.items.deleteMany({});
  await req.items.deleteMany({});
  await req.items.deleteMany({});
  await req.items.deleteMany({});
  await req.items.deleteMany({});
  await req.items.deleteMany({});
  await req.items.deleteMany({});

  const now = new Date();

  const users = Array.from({ length: randomNumberInclusive(10000, 10000) }).map(
    () => {
      const userId = generatePlutomiId({
        date: now,
        entity: AllEntityNames.USER
      });

      return {
        _id: userId,
        entityType: AllEntityNames.USER,
        firstName: "Jose",
        lastName: "Valerio",
        emailVerified: false,
        emailVerifiedAt: null,
        canReceiveEmails: true,
        email: "jose@plutomi.com",
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        relatedTo: [
          {
            id: userId,
            type: RelatedToType.SELF
          },
          {
            id: "jose@plutomi.com" as Email,
            type: RelatedToType.USERS
          }
        ]
      };
    }
  );

  const { _id: id } = randomItemFromArray(users);

  const notes = Array.from({ length: randomNumberInclusive(5, 20) }).map(() => {
    const noteId = generatePlutomiId({
      date: now,
      entity: AllEntityNames.NOTE
    });

    return {
      _id: noteId,
      entityType: AllEntityNames.NOTE,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      relatedTo: [
        {
          id: noteId,
          type: RelatedToType.SELF
        },
        {
          id,
          type: RelatedToType.NOTES
        }
      ]
    };
  });

  const files = Array.from({ length: randomNumberInclusive(5, 20) }).map(() => {
    const fileId = generatePlutomiId({
      date: now,
      entity: AllEntityNames.FILE
    });

    return {
      _id: fileId,
      entityType: AllEntityNames.FILE,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      relatedTo: [
        {
          id: fileId,
          type: RelatedToType.SELF
        },
        {
          id,
          type: RelatedToType.FILES
        }
      ]
    };
  });

  const memberships = Array.from({ length: randomNumberInclusive(5, 20) }).map(
    () => {
      const membershipId = generatePlutomiId({
        date: now,
        entity: AllEntityNames.MEMBERSHIP
      });

      return {
        _id: membershipId,
        entityType: AllEntityNames.MEMBERSHIP,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        relatedTo: [
          {
            id: membershipId,
            type: RelatedToType.SELF
          },
          {
            id,
            type: RelatedToType.MEMBERSHIPS
          }
        ]
      };
    }
  );

  const invites = Array.from({ length: randomNumberInclusive(5, 20) }).map(
    () => {
      const inviteId = generatePlutomiId({
        date: now,
        entity: AllEntityNames.INVITE
      });

      return {
        _id: inviteId,
        entityType: AllEntityNames.INVITE,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        relatedTo: [
          {
            id: inviteId,
            type: RelatedToType.SELF
          },
          {
            id,
            type: RelatedToType.INVITES
          }
        ]
      };
    }
  );

  const tasks = Array.from({ length: randomNumberInclusive(5, 20) }).map(() => {
    const taskId = generatePlutomiId({
      date: now,
      entity: AllEntityNames.TASK
    });

    return {
      _id: taskId,
      entityType: AllEntityNames.TASK,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      relatedTo: [
        {
          id: taskId,
          type: RelatedToType.SELF
        },
        {
          id,
          type: RelatedToType.TASKS
        }
      ]
    };
  });

  const sessions = Array.from({ length: randomNumberInclusive(5, 20) }).map(
    () => {
      const sessionId = generatePlutomiId({
        date: now,
        entity: AllEntityNames.SESSION
      });

      return {
        _id: sessionId,
        entityType: AllEntityNames.SESSION,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        relatedTo: [
          {
            id: sessionId,
            type: RelatedToType.SELF
          },
          {
            id,
            type: RelatedToType.SESSIONS
          }
        ]
      };
    }
  );

  const activity = Array.from({ length: randomNumberInclusive(5, 20) }).map(
    () => {
      const activityId = generatePlutomiId({
        date: now,
        entity: AllEntityNames.ACTIVITY
      });

      return {
        _id: activityId,
        entityType: AllEntityNames.ACTIVITY,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        relatedTo: [
          {
            id: activityId,
            type: RelatedToType.SELF
          },
          {
            id,
            type: RelatedToType.ACTIVITY
          }
        ]
      };
    }
  );

  await req.items.insertMany([
    ...users,
    ...notes,
    ...files,
    ...memberships,
    ...invites,
    ...tasks,
    ...sessions,
    ...activity
  ]);

  const aggregation = createJoinedAggregation({
    id,
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
      },
      {
        entityType: RelatedToType.MEMBERSHIPS,
        entityName: AllEntityNames.MEMBERSHIP
      },
      {
        entityType: RelatedToType.INVITES,
        entityName: AllEntityNames.INVITE
      },
      {
        entityType: RelatedToType.TASKS,
        entityName: AllEntityNames.TASK
      },
      {
        entityType: RelatedToType.SESSIONS,
        entityName: AllEntityNames.SESSION
      },
      {
        entityType: RelatedToType.ACTIVITY,
        entityName: AllEntityNames.ACTIVITY
      }
    ]
  });

  try {
    const x = await req.items.aggregate<User>(aggregation).toArray();

    const user: User | undefined = x[0];

    if (user === undefined) {
      res.status(404).send("User not found");
      return;
    }
    res.send(user);
  } catch (error) {
    res.send(error);
  }
};
