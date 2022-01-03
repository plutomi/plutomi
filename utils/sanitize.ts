// TODO clean this up this is a mess
export const keepProperties = (object: any, properties: string[]) => {
  let removedProperties = [];
  for (const property in object) {
    if (!properties.includes(property)) {
      delete object[property];
      removedProperties.push(property);
    }
  }
  return { object, removedProperties };
};

export const removeProperties = (object: any, properties: string[]) => {
  let removedProperties = [];

  for (const property of properties) {
    if (property in object) {
      // So we can have a list of properties that were removed
      removedProperties.push(property);
    }
    delete object[property];
  }
  return { object, removedProperties };
};
