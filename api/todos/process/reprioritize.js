import { withErrorHandling } from '../../../_lib/errors.js';
import { validateCronJob } from '../../../_lib/auth.js';
import { getTodoistApi } from '../../../_lib/todoist.js';
import { increaseUrgency, killOld } from '../../todoist/utils.js';

/**
 * Reprioritize todos - increases urgency and processes old todos
 * GET /api/todos/process/reprioritize
 *
 * Requires cron job authentication
 */
async function handler(req, res) {
  console.log(`[Cron Job] Starting reprioritize at ${new Date().toISOString()}`);

  // Validate cron job authentication
  validateCronJob(req);

  const api = getTodoistApi();
  const done1 = await increaseUrgency(api);
  const done2 = await killOld(api);

  const result = `${done1}. ${done2}`;

  console.log(`[Cron Job] Completed reprioritize successfully`);
  res.status(200).json({ success: true, result });
}

export default withErrorHandling(handler);
