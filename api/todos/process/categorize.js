import { withErrorHandling } from '../../../_lib/errors.js';
import { validateCronJob } from '../../../_lib/auth.js';
import { categorize } from '../../todoist/gpt.js';

/**
 * Categorize todos using GPT
 * GET /api/todos/process/categorize
 *
 * Requires cron job authentication
 */
async function handler(req, res) {
  console.log(`[Cron Job] Starting categorize at ${new Date().toISOString()}`);

  // Validate cron job authentication
  validateCronJob(req);

  const result = await categorize();

  console.log(`[Cron Job] Completed categorize successfully`);
  res.status(200).json({ success: true, result });
}

export default withErrorHandling(handler);
