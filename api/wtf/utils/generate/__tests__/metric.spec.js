import generateMetric from "../metric";
import playerModel from "../__fixtures__/player.js";

describe("generateMetric", () => {
  it("validates valid", () => {
    expect(generateMetric(playerModel)).toBe(5.18);
  });
});
