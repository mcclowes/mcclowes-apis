import { withErrorHandling, NotFoundError } from '../../../_lib/errors.js';
import { validateCronJob } from '../../../_lib/auth.js';
import { getTodoistApi } from '../../../_lib/todoist.js';
import { getTodos, moveToProject, PROJECT_ID_FOCUSED, PROJECT_ID_INBOX } from '../../todoist/utils.js';

/**
 * Process new day - moves todos from focused project to inbox
 * GET /api/todos/process/new-day
 *
 * Requires cron job authentication
 */
async function handler(req, res) {
  console.log(`[Cron Job] Starting new-day at ${new Date().toISOString()}`);

  // Validate cron job authentication
  validateCronJob(req);

  const api = getTodoistApi();
  const todos = await getTodos(api, PROJECT_ID_FOCUSED);

  if (!todos || todos.length === 0) {
    throw new NotFoundError("No todos found in focused project");
  }

  await moveToProject(todos, PROJECT_ID_INBOX);

  console.log(`[Cron Job] Completed new-day successfully`);
  res.status(200).json({ success: true, result: "DONE" });
}

export default withErrorHandling(handler);
