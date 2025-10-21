import { withErrorHandling, NotFoundError } from '../../../_lib/errors.js';
import { validateCronJob } from '../../../_lib/auth.js';
import { getTodoistApi } from '../../../_lib/todoist.js';
import { getTodos, moveToProject, bumpPriorities, PROJECT_ID_INBOX, PROJECT_ID_FOCUSED } from '../../todoist/utils.js';

/**
 * Set new day focus - selects and moves top 5 priority todos to focused project
 * GET /api/todos/process/new-day-focus
 *
 * Requires cron job authentication
 */
async function handler(req, res) {
  console.log(`[Cron Job] Starting new-day-focus at ${new Date().toISOString()}`);

  // Validate cron job authentication
  validateCronJob(req);

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

  console.log(`[Cron Job] Completed new-day-focus successfully`);
  res.status(200).json({ success: true, result: "DONE" });
}

export default withErrorHandling(handler);
