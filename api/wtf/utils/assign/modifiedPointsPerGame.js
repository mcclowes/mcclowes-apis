const MIN = 0.5;
const MAX = 1;
const INCREMENTS = 0.1; //0.05;
const START = 0.15; //0.5;

// adds a confidence metric based on no. games played
const calcModPointsPerGame = (player, maxGamesPlayed=5) => {
  const gamesBehind = Math.max(0, maxGamesPlayed - player.played);

  const confidence = Number(Math.max(
    MIN, 
    MAX - (gamesBehind * INCREMENTS)
  )).toFixed(2);

  const score = Number(Number(player["points_per_game"]) * confidence).toFixed(2);

  return Number(score)
};

export default calcModPointsPerGame;
