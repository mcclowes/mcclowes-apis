import * as dotenv from 'dotenv'
dotenv.config({path: '.env'})

import express from 'express'
import { handleError, handleAsync } from './api/errors/errorHandler'
import { AuthenticationError } from './api/errors/AppError'

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

// Apply hash validation to all routes
app.use(validateHash)

app.get('/todos', async (req, res) => await getAndSend(req, res, todoist.getTodos))
app.get('/todos/due', async (req, res) => await getAndSend(req, res, todoist.getTodosDue))
app.get('/todos/summarize', async (req, res) => await getAndSend(req, res, todoist.summarize))
app.get('/todos/process/reprioritize', async (req, res) => await getAndSend(req, res, todoist.reprioritize))
app.get('/todos/process/stale', async (req, res) => await getAndSend(req, res, todoist.killOld))
app.get('/todos/process/categorize', async (req, res) => await getAndSend(req, res, todoist.categorize))
app.get('/todos/process/new-day', async (req, res) => await getAndSend(req, res, todoist.newDay))
app.get('/todos/process/new-day-focus', async (req, res) => await getAndSend(req, res, todoist.newDayFocus))

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