// sort by metric
const assignPriceFormMetric = (list) => {
  return list.map((player) => {
    const pfm = (
      (player.form_rank + player.ppg_rank + player.metric_rank) /
      3
    ).toFixed(2);

    player["price_form_metric"] = pfm;

    return player;
  });
};

export default assignPriceFormMetric;
