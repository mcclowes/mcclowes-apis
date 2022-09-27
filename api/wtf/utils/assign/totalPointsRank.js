// assign total points
const assignTotalPointsRank = (list) => {
  list.sort((a, b) => {
    return a.total_points - b.total_points;
  });

  return list.map((player, i) => {
    player["total_points_rank"] = i;

    return player;
  });
};

export default assignTotalPointsRank;
