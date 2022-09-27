const positionModifiers = {
  goa: {
    // based on fabianski
    win: 1.35,
    draw: 0.5,
    lose: 0.35,
  },
  def: {
    // based on wan bissaka
    win: 1.5,
    draw: 1.5,
    lose: 0.5,
  },
  mid: {
    // based on richarlison
    win: 1.5,
    draw: 0.65,
    lose: 0.43,
  },
  str: {
    // based on jimenez
    win: 1.2,
    draw: 0.65,
    lose: 1.1,
  },
};

const modifyScoreForOdd = (ppg, mod, odd) => {
  const modifiedScore = Number((ppg * mod * odd).toFixed(2));

  return modifiedScore;
};

const modifyScore = (ppg, position, odds) => {
  const winScore = modifyScoreForOdd(
    ppg,
    positionModifiers[position].win,
    odds.win
  );
  const drawScore = modifyScoreForOdd(
    ppg,
    positionModifiers[position].draw,
    odds.draw
  );
  const loseScore = modifyScoreForOdd(
    ppg,
    positionModifiers[position].lose,
    odds.lose
  );
  const predictedScore = (winScore + loseScore + drawScore).toFixed(2);

  return Number(predictedScore);
};

const generatePredictedScore = (player, odds, key = "points_per_game") => {
  if (!odds || !odds.win) { return 0; }

  const score = Math.round(modifyScore(player[key], player.position, odds), 2);

  return player["chance_of_playing_next_round"] === null ||
    player["chance_of_playing_next_round"] === undefined
    ? score
    : (score * player["chance_of_playing_next_round"]) / 100;
};

export default generatePredictedScore;
