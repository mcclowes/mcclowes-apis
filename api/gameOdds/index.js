import fetch from 'node-fetch';

import generateGamblingOdds from "./generateGamblingOdds";
import generateTeamGames from "./generateTeamGames";

import { dates } from "./utils";

import gamblingAPIData from "./data/191207";

const debugPrint = (...toPrint) => {
  return process.env.NODE_ENV === "development" ? console.log(toPrint) : null;
};

const normalizeOdds = (odds) => {
  return odds.map((odd) => {
    return {
      ...odd,
      commenceTime: odd["commence_time"] * 1000,
    };
  });
};

const getEndpoint = () =>
  `https://api.the-odds-api.com/v3/odds?sport=soccer_epl&region=uk&mkt=h2h&apiKey=${process.env.REACT_APP_ODDS_TOKEN}`;

const gameOdds = () => {};

gameOdds.getDataAll = async (events) => {
  debugPrint("Events", events);

  let gamblingData;

  console.log(process.env.data === "test", !process.env.REACT_APP_ODDS_TOKEN)
  if (process.env.data === "test" || !process.env.REACT_APP_ODDS_TOKEN) {
    console.log('using test data')
    gamblingData = normalizeOdds(gamblingAPIData.data);
  } else {
    await fetch(getEndpoint())
      .then((response) => response.json())
      .then((data) => {
        gamblingData = normalizeOdds(data.data);
      });
  }

  const [nextGameweekStart, nextGameweekEnd] = dates.findGameweekPeriod(events);

  const gamblingOdds = generateGamblingOdds(gamblingData);
  debugPrint("Gambling odds: ", gamblingOdds);

  const gameweekGamblingOdds = generateGamblingOdds(
    gamblingData,
    nextGameweekStart,
    nextGameweekEnd
  );
  debugPrint("Gameweek gambling odds: ", gameweekGamblingOdds);

  const teamGames = generateTeamGames(gameweekGamblingOdds);
  debugPrint("Team games: ", teamGames);

  return {
    gamblingOdds,
    gameweekGamblingOdds,
    teamGames,
  };
};

export default gameOdds;
