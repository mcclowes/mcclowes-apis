const calcTeamShort = (player, teams) =>
  teams[player["team_code"]]["short_name"];

export default calcTeamShort;
