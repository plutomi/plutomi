import type { RelatedToType, AllEntityNames, PlutomiId } from "@plutomi/shared";
import type { Document } from "mongodb";

type EntitiesToRetrieve = AllEntityNames[];
/**
 * ! TODO: Some queries might need this to return nested entities.
 * ! DOUBLE NOTE: On the result, if the `_id` === entityType, the root entity was NOT FOUND.
 *  Example:
 *
 * /applicants/:id should return everything, but we will also have an endpoint for /applicants/:id/notes
 * and /notes/:id for a specific note which won't need this aggregation. Same with files and other stuff.
 */

type CreateJoinedAggregationProps = {
  /**
   * Id of the root entity.
   * ie: Give me an applicant and all of their notes & files -> Applicant is the root entity.
   */
  id: PlutomiId<AllEntityNames>;
  /**
   * What related entities to retrieve. For example:
   * An applicant's notes & files
   *
   * entitiesToRetrieve: ["note", "file"]
   */
  entitiesToRetrieve: EntitiesToRetrieve;
};

const createProjection = ({ entityNames }: { entityNames: AllEntityNames }) => {
  const projection: Record<string, unknown> = {};
  Object.values(entityNames).forEach((entityName) => {
    projection[entityName] = {
      $filter: {
        input: "$allItems",
        as: "item",
        cond: {
          $eq: ["$$item.entityType", entityName]
        }
      }
    };
  });

  return projection;
};

/**
 * Given an entity {@link AllEntities}, get the entity at the root as well as any entities that are related to it
 */
export const createJoinedAggregation = ({
  id,
  entitiesToRetrieve
}: CreateJoinedAggregationProps): Document[] => [
  {
    $match: {
      relatedTo: {
        $elemMatch: {
          id
        }
      }
    }
  },
  {
    $group: {
      _id: "entityType",
      allItems: {
        $push: "$$ROOT"
      }
    }
  },
  {
    $project: {
      ...createProjection({ entityNames: entitiesToRetrieve })
    }
  },
  {
    $replaceRoot: {
      newRoot: {
        $mergeObjects: [
          "$$ROOT",
          {
            $arrayElemAt: ["$user", 0]
          }
        ]
      }
    }
  },
  {
    $unset: "user"
  }
];

// ! TODO: Another shorter one if we go the _id first route and then the related items:

// [
//     {
//       '$match': {
//         'relatedTo': {
//           '$elemMatch': {
//             'id': 'user_9510'
//           }
//         }
//       }
//     }, {
//       '$group': {
//         '_id': 'entityType',
//         'allItems': {
//           '$push': '$$ROOT'
//         }
//       }
//     }, {
//       '$project': {
//         'notes': {
//           '$filter': {
//             'input': '$allItems',
//             'as': 'item',
//             'cond': {
//               '$eq': [
//                 '$$item.entityType', 'note'
//               ]
//             }
//           }
//         },
//         'files': {
//           '$filter': {
//             'input': '$allItems',
//             'as': 'item',
//             'cond': {
//               '$eq': [
//                 '$$item.entityType', 'file'
//               ]
//             }
//           }
//         }
//       }
//     }, {
//       '$unset': [
//         '_id'
//       ]
//     }
//   ]
