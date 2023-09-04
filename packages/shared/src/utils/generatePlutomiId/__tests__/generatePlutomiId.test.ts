import { IdPrefix } from "@plutomi/shared";
import { generatePlutomiId } from "../generatePlutomiId";

describe("generatePlutomiId", () => {
  it("generates a plutomi id", () => {
    expect(
      generatePlutomiId({
        date: new Date(),
        idPrefix: IdPrefix.LOCKED_AT
      })
    ).toBeTruthy();
  });
});
