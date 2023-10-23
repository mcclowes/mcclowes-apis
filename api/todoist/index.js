import fetch from 'node-fetch';

import { TodoistApi } from '@doist/todoist-api-typescript'
import { Configuration, OpenAIApi } from "openai";

import {
  getTodos,
  getTodosAll,
  getTodosDue,
  increaseUrgency,
  killOld,
  moveToProject,
  PROJECT_ID_INBOX,
  PROJECT_ID_FOCUSED,
  PROJECT_ID_NEXT,
} from './utils'
import { categorize, summarize } from './gpt'

const todoist = () => {};

todoist.getTodos = () => {
  const api = new TodoistApi(process.env.TODOIST_TOKEN)

  return getTodosAll(api) // should this be awaited?
};

todoist.getTodosDue = () => {
  const api = new TodoistApi(process.env.TODOIST_TOKEN)
  
  return getTodosDue(api)
};

todoist.killOld = () => {
  const api = new TodoistApi(process.env.TODOIST_TOKEN)

  return killOld(api);
}

const reprioritize = async () => {
  const api = new TodoistApi(process.env.TODOIST_TOKEN)

  const done1 = await increaseUrgency(api)
  const done2 = await killOld(api)
  const done3 = await newDay()

  return done1 + " " + done2 + " " + done3
}
todoist.reprioritize = reprioritize;

const clearOld = async () => {
  const api = new TodoistApi(process.env.TODOIST_TOKEN)
  const todos = await getTodos(api, PROJECT_ID_FOCUSED)

  await moveToProject(api, todos, PROJECT_ID_INBOX)

  return 'DONE'
}
todoist.newDay = clearOld;

const newFocus = async () => {
  const api = new TodoistApi(process.env.TODOIST_TOKEN)
  const todos = await getTodos(api, PROJECT_ID_NEXT)

  todos.sort((a,b) => a.priority - b.priority)

  await moveToProject(api, todos.slice(5), PROJECT_ID_FOCUSED)

  return 'DONE'
}
todoist.newDayFocus = newFocus;

todoist.summarize = summarize;
todoist.categorize = categorize;

export default todoist;