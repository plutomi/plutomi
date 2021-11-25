import { ENTITY_TYPES, SAFE_PROPERTIES, FORBIDDEN_PROPERTIES } from "../Config";

export default class Sanitize {
  /**
   * Removes properties from a given `entity`. Usually used for cleaning an entity before returning to a client, such as a public API route
   * @param entity Your entity
   * @param type: Your entity's type see {@link ENTITY_TYPES}
   * @returns Your entity but with ONLY the listed properties. See {@link SAFE_PROPERTIES}
   */
  static clean(entity: any, type: ENTITY_TYPES) {
    const safeProperties = SAFE_PROPERTIES[type];
    for (const property in entity) {
      if (!safeProperties.includes(property)) {
        delete entity[property];
      }
    }

    return entity;
  }
}
