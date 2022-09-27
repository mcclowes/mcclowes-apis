const assign = require("../assign");

const getUsefulPlayerProperties = (player) => {
  return {
    bps: player.bps,
    chance_of_playing_next_round: player.chance_of_playing_next_round,
    creativity: player.creativity,
    element_type: player.element_type,
    event_points: player.event_points,
    first_name: player.first_name,
    form: player.form,
    form_rank: player.form_rank,
    goals_conceded: player.goals_conceded,
    goals_scored: player.goals_scored,
    ict_index: player.ict_index,
    id: player.id,
    influence: player.influence,
    minutes: player.minutes,
    now_cost: player.now_cost,
    points_per_game: player.points_per_game,
    position: player.position,
    ppg_rank: player.ppg_rank,
    price: player.price,
    price_form_metric: player.price_form_metric,
    relative_price: player.relative_price,
    second_name: player.second_name,
    selected_by_percent: player.selected_by_percent,
    team: player.team,
    team_code: player.team_code,
    team_short: player.team_short,
    threat: player.threat,
    total_points: player.total_points,
    total_points_rank: player.total_points_rank,
    transfers_in: player.transfers_in,
    transfers_in_event: player.transfers_in_event,
    transfers_out: player.transfers_out,
    transfers_out_event: player.transfers_out_event,
    transfers_net: player.transfers_in - player.transfers_out,
    transfers_net_event: player.transfers_in_event - player.transfers_out_event,
    value_form: player.value_form,
    value_season: player.value_season,
    web_name: player.web_name,
  };
};

const calcPlayerMetrics = (player, teams) => {
  return {
    ...player,
    deamteam_factor: assign.dreamteamFactor(player),
    played: assign.played(player),
    points_per_pound: assign.pointsPerPound(player),
    position: assign.position(player),
    price: assign.price(player),
    relative_price: assign.relativePrice(player),
    team: assign.team(player, teams),
    team_short: assign.teamShort(player, teams),
  };
};

const calcDerivedPlayerMetrics = (player) => {
  return {
    ...player,
    metric: assign.metric(player),
    modified_points_per_game: assign.modPointsPerGame(player),
  };
};

const calcDerivedDerivedPlayerMetrics = (player, upcomingGames) => {
  return {
    ...player,
    predicted_points: assign.predictedPoints(player, upcomingGames),
    mod_predicted_points: assign.modPredictedPoints(player, upcomingGames),
    upcomingGames: assign.upcomingGames(player, upcomingGames),
  };
};

const all = (players, teams, upcomingGames) => {
  const expandedPlayerData = players
    .map((player) => getUsefulPlayerProperties(player))
    .map((player) => calcPlayerMetrics(player, teams))
    .map((player) => calcDerivedPlayerMetrics(player))
    .map((player) => calcDerivedDerivedPlayerMetrics(player, upcomingGames));

  assign.ppgRank(expandedPlayerData);
  assign.formRank(expandedPlayerData);
  assign.totalPointsRank(expandedPlayerData);
  assign.metricRank(expandedPlayerData);
  assign.priceFormMetric(expandedPlayerData);

  return expandedPlayerData;
};

const top = (players) => {
  return players
    .filter((player) => player.form > 1.5) // must be playing atm
    .filter((player) => player["predicted_points"] > 1) // scores points
    .filter((player) => player["points_per_pound"] > 0.2); // value is reasonable
  // .filter(player => player.minutes > 200; )// is established
  // .filter(player => player["chance_of_playing_this_round"] !== null; )// plays games
  // .filter(player => player["chance_of_playing_this_round"] > 75; )// is not injured
  // .filter(player => player.metric > 0.1; ) // metric is high
};

const players = {
  all,
  top,
};

export default players;
