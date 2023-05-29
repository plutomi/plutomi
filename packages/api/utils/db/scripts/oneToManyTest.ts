import type { RequestHandler } from "express";
import {
  IdPrefix,
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

  const users: User[] = Array.from({
    length: randomNumberInclusive(10000, 10000)
  }).map(() => {
    const userId = generatePlutomiId({
      date: now,
      entity: IdPrefix.USER
    });

    return {
      _id: userId,
      entityType: IdPrefix.USER,
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
  });

  const { _id: id } = randomItemFromArray(users);

  const notes = Array.from({ length: randomNumberInclusive(5, 20) }).map(() => {
    const noteId = generatePlutomiId({
      date: now,
      entity: IdPrefix.NOTE
    });

    return {
      _id: noteId,
      entityType: IdPrefix.NOTE,
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
      entity: IdPrefix.FILE
    });

    return {
      _id: fileId,
      entityType: IdPrefix.FILE,
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
        entity: IdPrefix.MEMBERSHIP
      });

      return {
        _id: membershipId,
        entityType: IdPrefix.MEMBERSHIP,
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
        entity: IdPrefix.INVITE
      });

      return {
        _id: inviteId,
        entityType: IdPrefix.INVITE,
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
      entity: IdPrefix.TASK
    });

    return {
      _id: taskId,
      entityType: IdPrefix.TASK,
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
        entity: IdPrefix.SESSION
      });

      return {
        _id: sessionId,
        entityType: IdPrefix.SESSION,
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
        entity: IdPrefix.ACTIVITY
      });

      return {
        _id: activityId,
        entityType: IdPrefix.ACTIVITY,
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

  // @ts-expect-error We don't have the actual entities for this yet so this will throw an error
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
        entityName: IdPrefix.USER
      },
      {
        entityType: RelatedToType.NOTES,
        entityName: IdPrefix.NOTE
      },
      {
        entityType: RelatedToType.FILES,
        entityName: IdPrefix.FILE
      },
      {
        entityType: RelatedToType.MEMBERSHIPS,
        entityName: IdPrefix.MEMBERSHIP
      },
      {
        entityType: RelatedToType.INVITES,
        entityName: IdPrefix.INVITE
      },
      {
        entityType: RelatedToType.TASKS,
        entityName: IdPrefix.TASK
      },
      {
        entityType: RelatedToType.SESSIONS,
        entityName: IdPrefix.SESSION
      },
      {
        entityType: RelatedToType.ACTIVITY,
        entityName: IdPrefix.ACTIVITY
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
