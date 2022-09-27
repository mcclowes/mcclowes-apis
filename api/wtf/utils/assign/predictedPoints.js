import generatePredictedScore from "../generate/predictedScore";
import teamNames from "./teamNames";

const teamName = (team) => teamNames[team];

const calcPredictedPoints = (player, upcomingGames) => {
  let predicted;

  if (upcomingGames.length) {
    predicted = upcomingGames.reduce((acc, game) => {
      return teamName(game.team) === player.team
        ? acc + generatePredictedScore(player, game)
        : acc;
    }, 0);
  } else {
    predicted = player.points_per_game;
  }

  return predicted;
};

export default calcPredictedPoints;
