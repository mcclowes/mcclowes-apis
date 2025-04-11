import { TodoistApi } from "@doist/todoist-api-typescript";
import { ExternalServiceError, NotFoundError } from "../errors/AppError";

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
} from "./utils";
import { categorize, summarize } from "./gpt";

const todoist = () => {};

const createTodoistApi = () => {
  if (!process.env.TODOIST_TOKEN) {
    throw new ExternalServiceError("TODOIST_TOKEN is not configured");
  }
  return new TodoistApi(process.env.TODOIST_TOKEN);
};

/**
 * @swagger
 * /todos:
 *   get:
 *     summary: Get all todos
 *     description: Retrieves all todos from Todoist
 *     tags: [Todos]
 *     responses:
 *       200:
 *         description: List of todos retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   content:
 *                     type: string
 *                   priority:
 *                     type: integer
 *       500:
 *         description: Server error
 */
todoist.getTodos = async () => {
  const api = createTodoistApi();
  try {
    return await getTodosAll(api);
  } catch (error) {
    throw new ExternalServiceError(`Failed to fetch todos: ${error.message}`);
  }
};

/**
 * @swagger
 * /todos/due:
 *   get:
 *     summary: Get due todos
 *     description: Retrieves todos that are due soon
 *     tags: [Todos]
 *     responses:
 *       200:
 *         description: List of due todos retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   content:
 *                     type: string
 *                   due:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Server error
 */
todoist.getTodosDue = async () => {
  const api = createTodoistApi();
  try {
    return await getTodosDue(api);
  } catch (error) {
    throw new ExternalServiceError(
      `Failed to fetch due todos: ${error.message}`
    );
  }
};

/**
 * @swagger
 * /todos/process/stale:
 *   get:
 *     summary: Process stale todos
 *     description: Identifies and processes todos that are stale
 *     tags: [Todos]
 *     responses:
 *       200:
 *         description: Stale todos processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error
 */
todoist.killOld = async () => {
  const api = createTodoistApi();
  try {
    return await killOld(api);
  } catch (error) {
    throw new ExternalServiceError(
      `Failed to process old todos: ${error.message}`
    );
  }
};

/**
 * @swagger
 * /todos/process/reprioritize:
 *   get:
 *     summary: Reprioritize todos
 *     description: Increases urgency of todos and processes old ones
 *     tags: [Todos]
 *     responses:
 *       200:
 *         description: Todos reprioritized successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error
 */
const reprioritize = async () => {
  const api = createTodoistApi();
  try {
    const done1 = await increaseUrgency(api);
    const done2 = await killOld(api);
    const done3 = await newDay();
    return `${done1} ${done2} ${done3}`;
  } catch (error) {
    throw new ExternalServiceError(
      `Failed to reprioritize todos: ${error.message}`
    );
  }
};
todoist.reprioritize = reprioritize;

/**
 * @swagger
 * /todos/process/new-day:
 *   get:
 *     summary: Process new day
 *     description: Moves todos from focused project to inbox
 *     tags: [Todos]
 *     responses:
 *       200:
 *         description: New day processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: No todos found in focused project
 *       500:
 *         description: Server error
 */
const clearOld = async () => {
  const api = createTodoistApi();
  try {
    const todos = await getTodos(api, PROJECT_ID_FOCUSED);
    if (!todos || todos.length === 0) {
      throw new NotFoundError("No todos found in focused project");
    }
    await moveToProject(api, todos, PROJECT_ID_INBOX);
    return "DONE";
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new ExternalServiceError(
      `Failed to clear old todos: ${error.message}`
    );
  }
};
todoist.newDay = clearOld;

/**
 * @swagger
 * /todos/process/new-day-focus:
 *   get:
 *     summary: Set new day focus
 *     description: Selects and moves top 5 priority todos to focused project
 *     tags: [Todos]
 *     responses:
 *       200:
 *         description: New focus set successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: No todos found in inbox project
 *       500:
 *         description: Server error
 */
const newFocus = async () => {
  const api = createTodoistApi();
  try {
    const todos = await getTodos(api, PROJECT_ID_INBOX);
    if (!todos || todos.length === 0) {
      throw new NotFoundError("No todos found in inbox project");
    }

    todos.sort((a, b) => b.priority - a.priority);
    const focusTodos = todos.slice(0, 5);

    if (focusTodos.length === 0) {
      throw new NotFoundError("No todos available to focus");
    }

    await bumpPriorities(api, focusTodos);
    await moveToProject(api, focusTodos, PROJECT_ID_FOCUSED);
    return "DONE";
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new ExternalServiceError(`Failed to set new focus: ${error.message}`);
  }
};
todoist.newDayFocus = newFocus;

/**
 * @swagger
 * /todos/summarize:
 *   get:
 *     summary: Summarize todos
 *     description: Generates a summary of todos using GPT
 *     tags: [Todos]
 *     responses:
 *       200:
 *         description: Todos summarized successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 summary:
 *                   type: string
 *       500:
 *         description: Server error
 */
todoist.summarize = async () => {
  try {
    return await summarize();
  } catch (error) {
    throw new ExternalServiceError(
      `Failed to summarize todos: ${error.message}`
    );
  }
};

/**
 * @swagger
 * /todos/process/categorize:
 *   get:
 *     summary: Categorize todos
 *     description: Uses GPT to categorize todos
 *     tags: [Todos]
 *     responses:
 *       200:
 *         description: Todos categorized successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 categories:
 *                   type: object
 *       500:
 *         description: Server error
 */
todoist.categorize = async () => {
  try {
    return await categorize();
  } catch (error) {
    throw new ExternalServiceError(
      `Failed to categorize todos: ${error.message}`
    );
  }
};

export default todoist;
