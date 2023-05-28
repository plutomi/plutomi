import type { RelatedToType, AllEntityNames, PlutomiId } from "@plutomi/shared";
import type { Document } from "mongodb";

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
  rootItem: AllEntityNames;
  /**
   * What related entities to retrieve. For example:
   * An applicant's notes & files
   *
   * entitiesToRetrieve: [RelatedToType.NOTES, RelatedToType.FILES]
   */
  entitiesToRetrieve: RelatedToType[];
  /**
   * Add the associated entityNames here. This is used to create the projection in the groupBy stage., This is the _id prefix.
   */
  entitiesToRetrieveNames: AllEntityNames[];
};

type CreateProjectionProps = {
  entityNames: AllEntityNames[];
};
const createProjection = ({ entityNames }: CreateProjectionProps) => {
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
  const final: RelatedToMatchObject[] = [];

  relatedToEntities.forEach((entity) => {
    final.push({
      relatedTo: {
        $elemMatch: {
          id,
          type: entity
        }
      }
    });
  });

  return { $or: final };
};
/**
 * Given an entity {@link AllEntities}, get the entity at the root as well as any entities that are related to it
 */
export const createJoinedAggregation = ({
  id,
  entitiesToRetrieve,
  entitiesToRetrieveNames,
  rootItem
}: CreateJoinedAggregationProps): Document[] => [
  {
    $match: {
      ...createMatchStage({ id, relatedToEntities: entitiesToRetrieve })
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
      ...createProjection({ entityNames: entitiesToRetrieveNames })
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
