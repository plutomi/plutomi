import {
  RelatedToType,
  type AllEntityNames,
  type PlutomiId
} from "@plutomi/shared";
import type { Document } from "mongodb";

type EntitiesToRetrieve = {
  /**
   * The type of the entity you want to retrieve. In the relatedTo array, this is the `type` property.
   */
  entityType: RelatedToType;
  /**
   * The entity name of the entity to retrieve. ie: If you want to retrieve all notes for an applicant, this would be AllEntityNames.NOTE.
   */
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
   * The entities you want to retrieve. This will be used to create the projection.
   *
   * @example
   * Give me an applicant and their notes & files
   * [{
   * entityType: RelatedToType.SELF,
   * entityName: AllEntityNames.APPLICANT
   * },
   * {
   *  entityType: RelatedToType.NOTES,
   * entityName: AllEntityNames.NOTE
   *
   * },
   * {
   * entityType: RelatedToType.FILES,
   * entityName: AllEntityNames.FILE}
   *
   * ]
   */
  entitiesToRetrieve: [
    {
      // First item must always be the root entity
      entityType: RelatedToType.SELF;
      entityName: AllEntityNames;
    },
    ...EntitiesToRetrieve[]
  ];
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

type CreateMatchFilterProps = {
  /**
   * The type of the root entity
   */
  entityType: RelatedToType;
};

const createMatchFilter = ({ entityType }: CreateMatchFilterProps) => ({
  // Filters out results if the root entity is not found
  [entityType]: {
    $ne: []
  }
});

const getRootEntityType = (entitiesToRetrieve: EntitiesToRetrieve[]) =>
  entitiesToRetrieve.filter((item) => item.entityType === RelatedToType.SELF)[0]
    .entityType;

/**
 * Given an entity {@link AllEntities}, get the entity at the root as well as any entities that are related to it
 */
export const createJoinedAggregation = ({
  id,
  entitiesToRetrieve
}: CreateJoinedAggregationProps): Document[] => {
  const rootEntityType = getRootEntityType(entitiesToRetrieve);
  const entityTypesOnly = entitiesToRetrieve.map((item) => item.entityType);
  return [
    {
      $match: {
        ...createMatchStage({
          id,
          relatedToEntities: entityTypesOnly
        })
      }
    },
    {
      $group: {
        _id: null,
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
      $match: {
        ...createMatchFilter({
          entityType: rootEntityType
        })
      }
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [
            "$$ROOT",
            {
              $arrayElemAt: [`$${rootEntityType}`, 0]
            }
          ]
        }
      }
    },
    {
      $unset: rootEntityType
    }
  ];
};
