import generatePredictedScore from "../generate/predictedScore";
import teamNames from "./teamNames";

const debugPrint = (...toPrint) => {
  return process.env.NODE_ENV === "development" ? console.log(toPrint) : null;
};

const teamName = (team) => teamNames[team];

const modifiedPredictedPoints = (player, upcomingGames) => {
  let predicted;

  if (upcomingGames.length) {
    predicted = upcomingGames.reduce((acc, game) => {
      return teamName(game.team) === player.team
        ? acc + generatePredictedScore(player, game, "modified_points_per_game")
        : acc;
    }, 0);
  } else {
    //predicted = player.points_per_game // if no games coming up
    predicted = 0;
  }

  return predicted;
};

export default modifiedPredictedPoints;
