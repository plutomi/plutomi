/**
 * This is needed due to the way we are indexing the 'relatedTo' array.  Here is an example user:
 * 
 * 
 *   const userData: User = {
      _id: userId,
      related_to: [
        {
          id: userId,
          type: RelatedToType.SELF
        },
        {
          id: null, // <--- If this item and the next had 'null' for the 'id', we would not be able to query for users without an org, as it would ALSO match the 'null' on the 'workspace' field.
          type: RelatedToType.USERS
        },
        { 
          id: "NO_WORKSPACE", // <--- We can query for users that do not have a workspace!
          type: RelatedToType.USERS
        },
        {
          id: email.toLocaleLowerCase().trim() as Email,
          type: RelatedToType.USERS
        }
      ]
    };
 */
export enum EmptyValues {
  NO_ORG = "NO_ORG",
  NO_WORKSPACE = "NO_WORKSPACE"
}
