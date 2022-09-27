const calcDreamteamFactor = (player) => {
  return 1 + player.dreamteam_count / 100;
};

export default calcDreamteamFactor;
