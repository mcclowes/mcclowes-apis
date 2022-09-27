const calcPlayed = (player) => {
  if (player["total_points"] === 0 || player["points_per_game"] === 0) {
    return 0;
  }

  const played = Number(
    player["total_points"] / player["points_per_game"]
  ).toFixed(0);

  return played;
};

export default calcPlayed;
