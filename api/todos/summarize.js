import { withErrorHandling } from '../../_lib/errors.js';
import { summarize } from '../todoist/gpt.js';

/**
 * Summarize todos using GPT
 * GET /api/todos/summarize
 *
 * This endpoint uses OpenAI to generate a summary of todos
 * Lazy loads OpenAI SDK only when needed
 */
async function handler(req, res) {
  const summary = await summarize();
  res.status(200).json({ summary });
}

export default withErrorHandling(handler);
