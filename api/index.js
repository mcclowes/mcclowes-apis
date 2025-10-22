/**
 * Health check endpoint
 * GET /api
 */
export default async function handler(req, res) {
  res.status(200).json({
    status: 'success',
    message: 'API is running',
    availablePaths: [
      '/api/todos',
      '/api/todos/due',
      '/api/todos/summarize',
      '/api/todos/process/categorize',
      '/api/todos/process/reprioritize',
      '/api/todos/process/stale',
      '/api/todos/process/new-day',
      '/api/todos/process/new-day-focus',
      '/api/api-docs'
    ]
  });
}
