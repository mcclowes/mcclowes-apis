const findOdds = (odd, total) => Number(odd / total).toFixed(2);

const generateTeamGames = (data) => {
  let teamGames = [];

  data.forEach((game) => {
    const total = game.home.odds + game.away.odds + game.draw.odds;

    teamGames.push({
      lose: findOdds(game.home.odds, total),
      draw: findOdds(game.draw.odds, total),
      win: findOdds(game.away.odds, total),
      team: game.home.team,
      commenceTime: game.commenceTime,
    });

    teamGames.push({
      lose: findOdds(game.away.odds, total),
      draw: findOdds(game.draw.odds, total),
      win: findOdds(game.home.odds, total),
      team: game.away.team,
      commenceTime: game.commenceTime,
    });
  });

  return teamGames;
};

export default generateTeamGames;
