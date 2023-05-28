import type { RelatedToType, AllEntityNames, PlutomiId } from "@plutomi/shared";
import type { Document } from "mongodb";

type EntitiesToRetrieve = {
  entityType: RelatedToType;
  entityName: AllEntityNames;
};

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
   * This is the main item / resource. For /applicants/:id, this would be RelatedTo.APPLICANT. For /users/:id, this would be RelatedTo.USER.
   * The user will be returned, and all other sub-entities will be returned in the `relatedTo` array.
   */
  rootItem: RelatedToType;

  entitiesToRetrieve: EntitiesToRetrieve[];
};

const createProjection = (entitiesToRetrieve: EntitiesToRetrieve[]) => {
  const projection: Record<string, unknown> = {};
  Object.values(entitiesToRetrieve).forEach((item) => {
    projection[item.entityType] = {
      $filter: {
        input: "$allItems",
        as: "item",
        cond: {
          $eq: ["$$item.entityType", item.entityName]
        }
      }
    };
  });

  return projection;
};

type CreateMatchStageProps = {
  id: PlutomiId<AllEntityNames>;
  relatedToEntities: RelatedToType[];
};

type RelatedToMatchObject = {
  relatedTo: {
    $elemMatch: {
      id: PlutomiId<AllEntityNames>;
      type: RelatedToType;
    };
  };
};

const createMatchStage = ({ id, relatedToEntities }: CreateMatchStageProps) => {
  const relatedItems: RelatedToMatchObject[] = relatedToEntities.map(
    (entity) => ({
      relatedTo: {
        $elemMatch: {
          id,
          type: entity
        }
      }
    })
  );

  return { $or: relatedItems };
};
/**
 * Given an entity {@link AllEntities}, get the entity at the root as well as any entities that are related to it
 */
export const createJoinedAggregation = ({
  id,
  entitiesToRetrieve,
  rootItem
}: CreateJoinedAggregationProps): Document[] => [
  {
    $match: {
      ...createMatchStage({
        id,
        relatedToEntities: entitiesToRetrieve.map((item) => item.entityType)
      })
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
      ...createProjection(entitiesToRetrieve)
    }
  },
  {
    $replaceRoot: {
      newRoot: {
        $mergeObjects: [
          "$$ROOT",
          {
            $arrayElemAt: [`$${rootItem}`, 0]
          }
        ]
      }
    }
  },
  {
    $unset: rootItem
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
