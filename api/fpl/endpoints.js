// fpl endpoints

const BASE_URL = "https://fantasy.premierleague.com/api";

// my team id 5333256

export const getEndpointBootstrap = () => `${BASE_URL}/bootstrap-static/`;

export const getEndpointUser = (opts) => `${BASE_URL}/entry/${opts.userId}/`

export const getEndpointPicks = (opts) => `${BASE_URL}/entry/${opts.userId}/event/${opts.eventId}/picks/`

export const getEndpointStandings = (opts) => `${BASE_URL}/leagues-classic/${opts.leagueId}/standings/`

export const getEndpointTransfers = (opts) => `${BASE_URL}/entry/${opts.userId}/transfers/`

export const getEndpointFixtures = (opts) => `${BASE_URL}/fixtures/?event=${opts.eventId}`
