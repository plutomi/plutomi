import type { RequestHandler } from "express";

export const get: RequestHandler = async (req, res) => {
  res.send(req.user);

  req.items.aggregate();
};

// ! TODO: Mongo aggregation make into function

// [
//   {
//     $match: {
//       relatedTo: {
//         $elemMatch: {
//           id: "user_9510"
//         }
//       }
//     }
//   },
//   {
//     $group: {
//       _id: "entityType",
//       allItems: {
//         $push: "$$ROOT"
//       }
//     }
//   },
//   {
//     $project: {
//       notes: {
//         $filter: {
//           input: "$allItems",
//           as: "item",
//           cond: {
//             $eq: ["$$item.entityType", "note"]
//           }
//         }
//       },
//       files: {
//         $filter: {
//           input: "$allItems",
//           as: "item",
//           cond: {
//             $eq: ["$$item.entityType", "file"]
//           }
//         }
//       },
//       user: {
//         $filter: {
//           input: "$allItems",
//           as: "item",
//           cond: {
//             $eq: ["$$item.entityType", "user"]
//           }
//         }
//       }
//     }
//   },
//   {
//     $replaceRoot: {
//       newRoot: {
//         $mergeObjects: [
//           "$$ROOT",
//           {
//             $arrayElemAt: ["$user", 0]
//           }
//         ]
//       }
//     }
//   },
//   {
//     $unset: "user"
//   }
// ];
