import { IdPrefix } from "../../../@types";
import { generatePlutomiId } from "../generatePlutomiId";

describe("generatePlutomiId", () => {
  it("generates a plutomi id", () => {
    const id = generatePlutomiId({
      date: new Date(),
      idPrefix: IdPrefix.USER
    });
    const prefix = `${IdPrefix.USER}_`;
    expect(id.startsWith(prefix)).toBe(true);
    expect(id.split(prefix)[1]?.length).toBeGreaterThanOrEqual(20);
  });
});
