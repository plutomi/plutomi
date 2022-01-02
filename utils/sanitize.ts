export const keepProperties = (object: any, properties: string[]) => {
  for (const property in object) {
    if (!properties.includes(property)) {
      delete object[property];
    }
  }
  return object;
};

export const removeProperties = (object: any, properties: string[]) => {
  for (const property of properties) {
    delete object[property];
  }
  return object;
};
