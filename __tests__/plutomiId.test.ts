import { IdPrefix } from "@plutomi/shared";
import { generatePlutomiId } from "../packages/api/utils/generatePlutomiId";

describe("plutomiId", () => {
  it("should return a string", () => {
    const x = generatePlutomiId({
      date: new Date(),
      idPrefix: IdPrefix.SESSION
    });

    expect(x).toBeInstanceOf(String);
  });
});
