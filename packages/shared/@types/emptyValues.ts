/**
 * This is needed due to the way we are indexing the 'target' array.  Here is an example user:
 * 
 * 
 *   const userData: User = {
      _id: userId,
      relatedTo: [
        {
          id: AllEntityNames.User,
          type: IndexableType.Entity
        },
        {
          id: userId,
          type: IndexableType.Id
        },
        {
          id: null, // <--- If this item and the next had 'null' for the 'id', we would not be able to query for users without an org, as it would ALSO match the 'null' on the 'workspace' field.
          type: IndexableType.User
        },
        { 
          id: "NO_WORKSPACE", // <--- We can query for users that do not have a workspace!
          type: IndexableType.User
        },
        {
          id: email.toLocaleLowerCase().trim() as Email,
          type: IndexableType.User
        }
      ]
    };
 */
export enum EmptyValues {
  NO_ORG = "NO_ORG",
  NO_WORKSPACE = "NO_WORKSPACE"
}
