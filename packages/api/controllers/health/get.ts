import type { RequestHandler } from "express";

const randomNumberBetween = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1) + min);

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

  const userId = `user_${randomNumberBetween(1, 10000)}`;
  const user = {
    _id: userId,
    name: "Saul Goodman",
    entityType: "user",
    relatedTo: [
      {
        id: userId,
        type: "id"
      }
    ]
  };

  const notes = Array.from({ length: randomNumberBetween(2, 20) }, () => ({
    _id: `${userId}#note_${randomNumberBetween(1, 10000)}`,
    entityType: "note",
    relatedTo: [
      {
        id: userId,
        type: "notes"
      }
    ]
  }));

  try {
    await req.items.insertMany([user, ...notes]);

    // const users = await req.items
    //   .find(
    //     {
    //       $or: [
    //         { relatedTo: { $elemMatch: { id: "user_9375", type: "notes" } } },
    //         { _id: /user_9375$/ }
    //       ]
    //     },
    //     {}
    //   )
    //   .toArray();
    res.status(201).json({ message: "inserted" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error inserting data to MongoDB!", error });
  }
  //   res.status(200).json({
  //     message: "Saul Goodman",
  //     db: result
  //   });
  // } catch (error) {
  //   res.status(500).json({ message: "Error connecting to MongoDB!", error });
  // }
};
