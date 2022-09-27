import wtf from "../index";

let combinedData;

describe("wtf", () => {
  beforeEach(async () => {
    combinedData = await wtf.getDataAll();
  });

  describe("players", () => {
    it.only("has the right amount", () => {
      expect(combinedData.players.length).toBeGreaterThan(500);
    });

    it("has positions", () => {
      expect(
        combinedData.players.filter((player) => player.position === "goa")
          .length
      ).toBeGreaterThan(50);
      expect(
        combinedData.players.filter((player) => player.position === "def")
          .length
      ).toBeGreaterThan(150);
      expect(
        combinedData.players.filter((player) => player.position === "mid")
          .length
      ).toBeGreaterThan(200);
      expect(
        combinedData.players.filter((player) => player.position === "str")
          .length
      ).toBeGreaterThan(50);
    });
  });

  describe("topPlayers", () => {
    it("has the right amount", () => {
      expect(combinedData.topPlayers.length).toBeGreaterThan(100);
    });

    it("has positions", () => {
      expect(
        combinedData.topPlayers.filter((player) => player.position === "goa")
          .length
      ).toBeGreaterThan(10);
      expect(
        combinedData.topPlayers.filter((player) => player.position === "def")
          .length
      ).toBeGreaterThan(35);
      expect(
        combinedData.topPlayers.filter((player) => player.position === "mid")
          .length
      ).toBeGreaterThan(40);
      expect(
        combinedData.topPlayers.filter((player) => player.position === "str")
          .length
      ).toBeGreaterThan(18);
    });
  });
});
