// sort by metric
const assignMetricRank = (list) => {
  list.sort((a, b) => {
    return a.metric - b.metric;
  });

  return list.map((player, i) => {
    player["metric_rank"] = i;

    return player;
  });
};

export default assignMetricRank;
