import { faker } from "@faker-js/faker";

export const createRandomOrgName = () => {
  const randomColor = faker.color.human();
  const randomAdjective = faker.commerce.productAdjective();
  const randomThing =
    Math.random() > 0.5 ? faker.commerce.product() : faker.vehicle.type();
  const randomOrgName = [randomColor, randomAdjective, randomThing]
    .map((word) => word.toLowerCase())
    .join("-");

  return randomOrgName;
};
