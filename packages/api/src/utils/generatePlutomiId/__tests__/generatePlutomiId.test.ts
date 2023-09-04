import { IdPrefix } from "@plutomi/shared";
import { generatePlutomiId } from "../generatePlutomiId";

describe("generatePlutomiId", () => {
  it("should return a string", () => {
    const x = generatePlutomiId({
      date: new Date(),
      idPrefix: IdPrefix.USER
    });

    expect(typeof x).toBe("string");
  });
});
