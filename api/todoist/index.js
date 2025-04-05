import fetch from 'node-fetch';
import { TodoistApi } from '@doist/todoist-api-typescript'
import { Configuration, OpenAIApi } from "openai";
import { ExternalServiceError, NotFoundError } from '../errors/AppError';

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

const createTodoistApi = () => {
  if (!process.env.TODOIST_TOKEN) {
    throw new ExternalServiceError('TODOIST_TOKEN is not configured');
  }
  return new TodoistApi(process.env.TODOIST_TOKEN);
};

todoist.getTodos = async () => {
  const api = createTodoistApi();
  try {
    return await getTodosAll(api);
  } catch (error) {
    throw new ExternalServiceError(`Failed to fetch todos: ${error.message}`);
  }
};

todoist.getTodosDue = async () => {
  const api = createTodoistApi();
  try {
    return await getTodosDue(api);
  } catch (error) {
    throw new ExternalServiceError(`Failed to fetch due todos: ${error.message}`);
  }
};

todoist.killOld = async () => {
  const api = createTodoistApi();
  try {
    return await killOld(api);
  } catch (error) {
    throw new ExternalServiceError(`Failed to process old todos: ${error.message}`);
  }
};

const reprioritize = async () => {
  const api = createTodoistApi();
  try {
    const done1 = await increaseUrgency(api);
    const done2 = await killOld(api);
    const done3 = await newDay();
    return `${done1} ${done2} ${done3}`;
  } catch (error) {
    throw new ExternalServiceError(`Failed to reprioritize todos: ${error.message}`);
  }
};
todoist.reprioritize = reprioritize;

const clearOld = async () => {
  const api = createTodoistApi();
  try {
    const todos = await getTodos(api, PROJECT_ID_FOCUSED);
    if (!todos || todos.length === 0) {
      throw new NotFoundError('No todos found in focused project');
    }
    await moveToProject(api, todos, PROJECT_ID_INBOX);
    return 'DONE';
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new ExternalServiceError(`Failed to clear old todos: ${error.message}`);
  }
};
todoist.newDay = clearOld;

const newFocus = async () => {
  const api = createTodoistApi();
  try {
    const todos = await getTodos(api, PROJECT_ID_INBOX);
    if (!todos || todos.length === 0) {
      throw new NotFoundError('No todos found in inbox project');
    }

    todos.sort((a, b) => b.priority - a.priority);
    const focusTodos = todos.slice(0, 5);

    if (focusTodos.length === 0) {
      throw new NotFoundError('No todos available to focus');
    }

    await bumpPriorities(api, focusTodos);
    await moveToProject(api, focusTodos, PROJECT_ID_FOCUSED);
    return 'DONE';
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new ExternalServiceError(`Failed to set new focus: ${error.message}`);
  }
};
todoist.newDayFocus = newFocus;

todoist.summarize = async () => {
  try {
    return await summarize();
  } catch (error) {
    throw new ExternalServiceError(`Failed to summarize todos: ${error.message}`);
  }
};

todoist.categorize = async () => {
  try {
    return await categorize();
  } catch (error) {
    throw new ExternalServiceError(`Failed to categorize todos: ${error.message}`);
  }
};

export default todoist;