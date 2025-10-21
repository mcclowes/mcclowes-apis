import { withErrorHandling } from '../../_lib/errors.js';
import { getTodoistApi } from '../../_lib/todoist.js';
import { getTodosDue } from '../todoist/utils.js';

/**
 * Get due todos
 * GET /api/todos/due
 */
async function handler(req, res) {
  const api = getTodoistApi();
  const todos = await getTodosDue(api);
  res.status(200).json(todos);
}

export default withErrorHandling(handler);
