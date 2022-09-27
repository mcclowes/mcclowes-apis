import moment from "moment";

const calculateOdds = (sites, i) => {
  return sites.reduce((acc, gameOdds) => {
    const total = gameOdds.odds.h2h.reduce((acc, x) => acc + x);

    return (acc + gameOdds.odds.h2h[i]) / total;
  }, 0);
};

const generateGamblingOdds = (data, nextGameweekStart, nextGameweekEnd) => {
  return data
    .filter((game) => {
      if (nextGameweekStart !== undefined && nextGameweekEnd !== undefined) {
        return (
          moment(game.commenceTime) >= moment(nextGameweekStart) &&
          moment(game.commenceTime) < moment(nextGameweekEnd)
        );
      } else {
        return true;
      }
    })
    .map((game) => {
      return {
        home: {
          team: game.teams[0],
          odds: calculateOdds(game.sites, 0),
        },
        away: {
          team: game.teams[1],
          odds: calculateOdds(game.sites, 2),
        },
        draw: {
          odds: calculateOdds(game.sites, 1),
        },
        commenceTime: game.commenceTime,
      };
    });
};

export default generateGamblingOdds;
