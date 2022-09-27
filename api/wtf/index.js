import fpl from "../fpl";
import gameOdds from "../gameOdds";
import * as utils from "./utils";

const debugPrint = (...toPrint) => {
  return process.env.NODE_ENV === "development" ? console.log(toPrint) : null;
};

const getRawFpl = async () => {
  const fplData = await fpl.getDataAll();
  debugPrint("FPL API Data", fplData);
  return fplData
}

const getDataAll = async () => {
  const fplData = await getRawFpl()

  const teamGamblingData = await gameOdds.getDataAll(fplData.events);
  debugPrint("Gambling data", teamGamblingData);

  const upcomingGames = teamGamblingData.teamGames;
  const teams = utils.generate.teams(fplData.teams);

  const players = utils.generate.players.all(
    fplData.elements,
    teams,
    upcomingGames
  );
  
  const topPlayers = utils.generate.players.top(players);

  debugPrint("All players: ", players);
  debugPrint("Top players: ", topPlayers);

  const mappedPlayers = utils.transform.playersToPositions(players);

  return {
    rawFPLData: fplData,
    rawGamblingData: teamGamblingData,
    gameOdds: upcomingGames,
    players,
    playersByPosition: mappedPlayers,
    topPlayers,
    teams,
  };
};

const wtf = () => {};

wtf.getDataAll = getDataAll

wtf.getRawFpl = getRawFpl

wtf.getListPredictedScore = async () => {
  const { players } = await getDataAll();

  return players && players.sort((a,b) => b.mod_predicted_points - a.mod_predicted_points).slice(0,10)
}

wtf.getListTransfers = async () => {
  const { players } = await getDataAll();

  return players && players.sort((a,b) => b.transfers_net_event - a.transfers_net_event).slice(0,10)
}

wtf.getListTopScore = async () => {
  const { elements: players } = await getRawFpl();

  return players && players.sort((a,b) => b.total_points - a.total_points).slice(0,10)
}

export default wtf;
