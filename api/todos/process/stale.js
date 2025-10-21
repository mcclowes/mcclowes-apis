import { withErrorHandling } from '../../../_lib/errors.js';
import { validateCronJob } from '../../../_lib/auth.js';
import { getTodoistApi } from '../../../_lib/todoist.js';
import { killOld } from '../../todoist/utils.js';

/**
 * Process stale todos
 * GET /api/todos/process/stale
 *
 * Requires cron job authentication
 */
async function handler(req, res) {
  console.log(`[Cron Job] Starting stale at ${new Date().toISOString()}`);

  // Validate cron job authentication
  validateCronJob(req);

  const api = getTodoistApi();
  const result = await killOld(api);

  console.log(`[Cron Job] Completed stale successfully`);
  res.status(200).json({ success: true, result });
}

export default withErrorHandling(handler);
