import { faker } from "@faker-js/faker/locale/en";

export const createRandomWorkspaceId = () => {
  const randomColor = faker.color.human();
  const randomAdjective = faker.commerce.productAdjective();
  const randomThing =
    Math.random() > 0.5
      ? faker.commerce.product()
      : faker.commerce.productMaterial();

  return [randomColor, randomAdjective, randomThing]
    .map((word) => word.toLowerCase())
    .join("-");
};
