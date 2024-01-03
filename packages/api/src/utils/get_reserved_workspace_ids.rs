use std::collections::HashSet;

use crate::consts::RESERVED_WORKSPACE_IDS;

/**
 * Creates a set of reserved workspace ids for faster lookup.
 * TODO Run at startup and pass using app state?
 *
 */
pub fn get_reserved_workspace_ids() -> HashSet<&'static str> {
    let mut reserved_ids_set = HashSet::with_capacity(RESERVED_WORKSPACE_IDS.len());
    reserved_ids_set.extend(RESERVED_WORKSPACE_IDS.iter().cloned());
    reserved_ids_set
}
