const playersToPositions = (players) => ({
  goa: players.filter((player) => {
    return player.position === "goa";
  }),
  def: players.filter((player) => {
    return player.position === "def";
  }),
  mid: players.filter((player) => {
    return player.position === "mid";
  }),
  str: players.filter((player) => {
    return player.position === "str";
  }),
});

export default playersToPositions;