import fetch from 'node-fetch';

import { TodoistApi } from '@doist/todoist-api-typescript'
import { Configuration, OpenAIApi } from "openai";

import {
  bumpPriorities,
  getTodos,
  getTodosAll,
  getTodosDue,
  increaseUrgency,
  killOld,
  moveToProject,
  PROJECT_ID_INBOX,
  PROJECT_ID_FOCUSED,
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
  const todos = await getTodos(api, PROJECT_ID_INBOX)

  todos.sort((a,b) => b.priority - a.priority)

  const focusTodos = todos.slice(0, 5)

  console.log(focusTodos)
  await bumpPriorities(api, focusTodos)
  await moveToProject(api, focusTodos, PROJECT_ID_FOCUSED)

  return 'DONE'
}
todoist.newDayFocus = newFocus;

todoist.summarize = summarize;
todoist.categorize = categorize;

export default todoist;