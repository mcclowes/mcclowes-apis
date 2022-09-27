import modifiedPointsPerGame from "../modifiedPointsPerGame";

const players = [
  { id: 1, points_per_game: 10, played: 1 },
  { id: 2, points_per_game: 10, played: 2 },
  { id: 3, points_per_game: 10, played: 3 },
  { id: 4, points_per_game: 10, played: 4 },
  { id: 5, points_per_game: 10, played: 5 },
  { id: 6, points_per_game: 10, played: 6 },
  { id: 7, points_per_game: 10, played: 7 },
  { id: 8, points_per_game: 10, played: 8 },
  { id: 9, points_per_game: 10, played: 9 },
  { id: 10, points_per_game: 10, played: 10 },
  { id: 11, points_per_game: 10, played: 11 },
  { id: 12, points_per_game: 10, played: 12 },
  { id: 13, points_per_game: 10, played: 13 },
  { id: 14, points_per_game: 10, played: 14 },
  { id: 15, points_per_game: 10, played: 15 },
];

describe("generate modifiedPointsPerGame", () => {
  it("returns correct list", () => {
    expect(modifiedPointsPerGame(players[0])).toEqual(6);
    expect(modifiedPointsPerGame(players[1])).toEqual(7);
    expect(modifiedPointsPerGame(players[2])).toEqual(8);
    expect(modifiedPointsPerGame(players[3])).toEqual(9);
    expect(modifiedPointsPerGame(players[4])).toEqual(10);
    expect(modifiedPointsPerGame(players[6])).toEqual(10);
    expect(modifiedPointsPerGame(players[7])).toEqual(10);
    expect(modifiedPointsPerGame(players[8])).toEqual(10);
    expect(modifiedPointsPerGame(players[9])).toEqual(10);
    expect(modifiedPointsPerGame(players[14])).toEqual(10);
  });

  it("with games played", () => {
    expect(modifiedPointsPerGame(players[0], 1)).toEqual(10);
    expect(modifiedPointsPerGame(players[0], 3)).toEqual(8);
    expect(modifiedPointsPerGame(players[0], 10)).toEqual(5);
    expect(modifiedPointsPerGame(players[1], 1)).toEqual(10);
    expect(modifiedPointsPerGame(players[1], 3)).toEqual(9);
    expect(modifiedPointsPerGame(players[1], 10)).toEqual(5);
    expect(modifiedPointsPerGame(players[6], 1)).toEqual(10);
    expect(modifiedPointsPerGame(players[6], 3)).toEqual(10);
    expect(modifiedPointsPerGame(players[6], 10)).toEqual(7);
    expect(modifiedPointsPerGame(players[9], 1)).toEqual(10);
    expect(modifiedPointsPerGame(players[9], 3)).toEqual(10);
    expect(modifiedPointsPerGame(players[9], 10)).toEqual(10);
    expect(modifiedPointsPerGame(players[14], 1)).toEqual(10);
    expect(modifiedPointsPerGame(players[14], 3)).toEqual(10);
    expect(modifiedPointsPerGame(players[14], 10)).toEqual(10);
  });
});
