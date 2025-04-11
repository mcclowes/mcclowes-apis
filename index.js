import * as dotenv from 'dotenv'
dotenv.config({path: '.env'})

import express from 'express'
import swaggerUi from 'swagger-ui-express'
import { handleError, handleAsync } from './api/errors/errorHandler'
import { AuthenticationError } from './api/errors/AppError'
import { specs } from './api/docs/swagger'

import todoist from './api/todoist'

const app = express()

// Middleware to validate hash authentication
const validateHash = (req, res, next) => {
  const hash = req.query.hash || req.params.hash;
  if (!hash || hash !== process.env.HASH) {
    throw new AuthenticationError('Invalid or missing authentication hash');
  }
  next();
};

// Middleware to validate cron job authentication
const validateCronJob = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    throw new AuthenticationError('Invalid or missing cron job authentication');
  }
  next();
};

// Enhanced error handling for cron jobs
const handleCronJob = (handler) => async (req, res) => {
  try {
    console.log(`[Cron Job] Starting ${req.path} at ${new Date().toISOString()}`);
    const result = await handler(req.params);
    console.log(`[Cron Job] Completed ${req.path} successfully`);
    res.json({ success: true, result });
  } catch (error) {
    console.error(`[Cron Job] Failed ${req.path}:`, error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// Serve Swagger documentation
app.use('/api-docs', (req, res, next) => {
  // Skip hash validation for Swagger UI
  if (req.path === '/') {
    next();
  } else {
    validateHash(req, res, next);
  }
}, swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
  },
}));

const getAndSend = handleAsync(async (req, res, func) => {
  const data = await func(req.params)
  res.json(data)
})

app.get('/', (req, res) => { 
  res.json({
    status: 'success',
    message: 'API is running',
    availablePaths: [
      '/todos',
      '/todos/due',
      '/todos/process/reprioritize',
      '/todos/process/stale',
      '/todos/process/new-day',
      '/todos/process/new-day-focus'
    ]
  })
})

// Public routes
app.get('/todos', async (req, res) => await getAndSend(req, res, todoist.getTodos))
app.get('/todos/due', async (req, res) => await getAndSend(req, res, todoist.getTodosDue))
app.get('/todos/summarize', async (req, res) => await getAndSend(req, res, todoist.summarize))
app.get('/todos/process/categorize', async (req, res) => await getAndSend(req, res, todoist.categorize))

// Cron job routes with enhanced error handling
app.get('/todos/process/reprioritize', validateCronJob, handleCronJob(todoist.reprioritize))
app.get('/todos/process/stale', validateCronJob, handleCronJob(todoist.killOld))
app.get('/todos/process/new-day', validateCronJob, handleCronJob(todoist.newDay))
app.get('/todos/process/new-day-focus', validateCronJob, handleCronJob(todoist.newDayFocus))

// Handle 404 errors
app.use((req, res, next) => {
  res.status(404).json({
    status: 'error',
    code: 'NOT_FOUND',
    message: `Cannot find ${req.originalUrl} on this server!`
  });
});

// Error handling middleware
app.use(handleError)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`))

export default app