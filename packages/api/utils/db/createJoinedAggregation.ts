import type { RelatedToType, AllEntityNames, PlutomiId } from "@plutomi/shared";
import type { Document } from "mongodb";

/**
 * ! TODO: Some queries might need this to return nested entities. Example:
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
  entitiesToRetrieve: RelatedToType[];
};

/**
 * Given an entity {@link AllEntities}, get the entity at the root as well as any entities that are related to it
 */
export const createJoinedAggregation = ({
  id
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
      notes: {
        $filter: {
          input: "$allItems",
          as: "item",
          cond: {
            $eq: ["$$item.entityType", "note"]
          }
        }
      },
      files: {
        $filter: {
          input: "$allItems",
          as: "item",
          cond: {
            $eq: ["$$item.entityType", "file"]
          }
        }
      },
      user: {
        $filter: {
          input: "$allItems",
          as: "item",
          cond: {
            $eq: ["$$item.entityType", "user"]
          }
        }
      }
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
