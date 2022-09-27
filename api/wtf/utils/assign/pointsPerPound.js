const calcPointsPerPound = (player) => {
  const price = player["now_cost"] / 10;
  const ppp = player["points_per_game"] / price;
  return ppp.toFixed(2);
};

export default calcPointsPerPound;
