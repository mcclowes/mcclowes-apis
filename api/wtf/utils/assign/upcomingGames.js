import generatePredictedScore from "../generate/predictedScore";
import teamNames from "./teamNames";

const teamName = (team) => teamNames[team];

const calcUpcomingGames = (player, upcomingGames) => {
  let upcoming;

  if (upcomingGames.length) {
    upcoming = upcomingGames.reduce((acc, game) => {
      return teamName(game.team) === player.team
        ? acc + 1
        : acc;
    }, 0);
  } else {
    upcoming = 0;
  }

  return upcoming;
};

export default calcUpcomingGames;
