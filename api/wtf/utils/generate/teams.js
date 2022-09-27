const teams = (teams) => {
  let newTeams = {};

  teams
    .filter((team) => {
      return !!team.name;
    })
    .forEach((team) => {
      newTeams[team.code] = team;
    });

  return newTeams;
};

export default teams;
