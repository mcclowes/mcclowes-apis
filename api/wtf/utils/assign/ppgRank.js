const assignPointsPerGameRank = (list) => {
  list.sort((a, b) => {
    return b.points_per_pound - a.points_per_pound;
  });

  return list.map((player, i) => {
    player["ppg_rank"] = i;
    return player;
  });
};

export default assignPointsPerGameRank;
