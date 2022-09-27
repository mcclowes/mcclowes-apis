const generateMetric = (player) => {
  const pointsPerPound = player.points_per_pound;

  const pointsPerGameFactor = 0.1;
  const pointsPerGame = (1 + player.points_per_game) * pointsPerGameFactor;

  const ictFactor = 0.1;
  const ict = 1 + (player.ict_index / 100 - 1) * ictFactor;

  const formFactor = 0.3;
  const form = 1 + (player.form * formFactor) / 10;

  return Number((pointsPerPound * ict * form * pointsPerGame).toFixed(2));
};

export default generateMetric;
