import { withErrorHandling } from '../../_lib/errors.js';
import { getTodoistApi } from '../../_lib/todoist.js';
import { getTodosAll } from '../todoist/utils.js';

/**
 * Get all todos
 * GET /api/todos
 */
async function handler(req, res) {
  const api = getTodoistApi();
  const todos = await getTodosAll(api);
  res.status(200).json(todos);
}

export default withErrorHandling(handler);
