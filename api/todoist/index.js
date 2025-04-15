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

/**
 * Todoist API service
 * Provides methods to interact with the Todoist API
 */
const todoist = () => {};

/**
 * Creates a Todoist API client
 * @returns {TodoistApi} Todoist API client
 * @throws {ExternalServiceError} If TODOIST_TOKEN is not configured
 */
const createTodoistApi = () => {
  if (!process.env.TODOIST_TOKEN) {
    throw new ExternalServiceError("TODOIST_TOKEN is not configured");
  }
  return new TodoistApi(process.env.TODOIST_TOKEN);
};

/**
 * Gets a Todoist API client instance
 * Uses a singleton pattern to avoid creating multiple instances
 * @returns {TodoistApi} Todoist API client
 */
const getTodoistApi = (() => {
  let apiInstance = null;
  
  return () => {
    if (!apiInstance) {
      apiInstance = createTodoistApi();
    }
    return apiInstance;
  };
})();

/**
 * Wraps an API call with error handling
 * @param {Function} apiCall - The API call to execute
 * @param {string} errorMessage - The error message to use if the call fails
 * @returns {Promise<any>} The result of the API call
 * @throws {ExternalServiceError} If the API call fails
 */
const withErrorHandling = async (apiCall, errorMessage) => {
  try {
    return await apiCall();
  } catch (error) {
    throw new ExternalServiceError(`${errorMessage}: ${error.message}`);
  }
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
  return withErrorHandling(
    async () => {
      const api = getTodoistApi();
      return await getTodosAll(api);
    },
    "Failed to fetch todos"
  );
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
  return withErrorHandling(
    async () => {
      const api = getTodoistApi();
      return await getTodosDue(api);
    },
    "Failed to fetch due todos"
  );
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
  return withErrorHandling(
    async () => {
      const api = getTodoistApi();
      return await killOld(api);
    },
    "Failed to process old todos"
  );
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
todoist.reprioritize = async () => {
  return withErrorHandling(
    async () => {
      const api = getTodoistApi();
      const done1 = await increaseUrgency(api);
      const done2 = await killOld(api);
      const done3 = await todoist.newDay();
      return `${done1} ${done2} ${done3}`;
    },
    "Failed to reprioritize todos"
  );
};

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
todoist.newDay = async () => {
  return withErrorHandling(
    async () => {
      const api = getTodoistApi();
      const todos = await getTodos(api, PROJECT_ID_FOCUSED);
      if (!todos || todos.length === 0) {
        throw new NotFoundError("No todos found in focused project");
      }
      await moveToProject(todos, PROJECT_ID_INBOX);
      return "DONE";
    },
    "Failed to clear old todos"
  );
};

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
todoist.newDayFocus = async () => {
  return withErrorHandling(
    async () => {
      const api = getTodoistApi();
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
      await moveToProject(focusTodos, PROJECT_ID_FOCUSED);
      return "DONE";
    },
    "Failed to set new focus"
  );
};

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
  return withErrorHandling(
    async () => {
      return await summarize();
    },
    "Failed to summarize todos"
  );
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
  return withErrorHandling(
    async () => {
      return await categorize();
    },
    "Failed to categorize todos"
  );
};

export default todoist;
