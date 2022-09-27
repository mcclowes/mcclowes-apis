import generatePredictedScore from "../predictedScore";
import gamblingOdds from "../__fixtures__/gamblingOdds.js";
import playerModel from "../__fixtures__/player.js";

describe("generatePredictedScore", () => {
  it("validates valid", () => {
    expect(generatePredictedScore(playerModel, gamblingOdds)).toBe(0);
    /// broken
  });

  it("returns 0 if no games", () => {
    expect(generatePredictedScore(playerModel, {})).toBe(0);

    expect(generatePredictedScore(playerModel, undefined)).toBe(0);
  });
});
