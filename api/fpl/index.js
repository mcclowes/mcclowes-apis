import fetch from 'node-fetch';

import fplData from "./data/201110";
import { getEndpointBootstrap, getEndpointUser, getEndpointPicks } from "./endpoints";

const corsProxy = "https://fpl-proxy.herokuapp.com/";

const fpl = () => {};

const getResponse = async response => {
  if (response.status === 204) return {}

  const contentType = response.headers.get('content-type');

  if (contentType && contentType.includes('json')) {
    return response.json();
  } else {
    return response.text();
  }
}

const niceFetch = async (url, options={}) => {
  const response = await fetch(url, options);

  const data = await getResponse(response)

  return data
}

const options = {
  headers: {
    'User-Agent': 'ANYTHING_WILL_WORK_HERE'
  }
}

fpl.getDataAll = async () => {
  if (process.env.DATA === "test") {
    return fplData;
  } else {
    const url = `${corsProxy}${getEndpointBootstrap()}`

    const data = await niceFetch(url, options)

    if(!data) { return new Error('No FPL data returned') }

    return data;
  }
};

fpl.getUser = async (params) => {
  const url = `${corsProxy}${getEndpointUser(params)}`

  const data = await niceFetch(url, options)

  if(!data) { return new Error('No data returned') }

  return data;
};

fpl.getUserPicks = async (params) => {
  const url = `${corsProxy}${getEndpointPicks(params)}`

  const data = await niceFetch(url, options)

  if(!data) { return new Error('No data returned') }

  return data;
};

export default fpl;
