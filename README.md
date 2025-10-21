# mcclowes-api

A Node.js REST API for personal productivity automation, integrating Todoist task management with AI-powered categorization and summarization via OpenAI's GPT models.

## Features

- **Todoist Integration**: Complete CRUD operations for tasks via Todoist API
- **AI-Powered Task Management**:
  - Automatic task categorization using GPT-4
  - Intelligent task summarization with GPT-3.5 Turbo
  - Smart priority management
- **Automated Task Processing**:
  - Auto-completion of stale tasks (250+ days old)
  - Automatic urgency escalation for overdue tasks
  - Daily task focus management
- **Production-Ready**:
  - Input validation and sanitization
  - Comprehensive error handling
  - Authentication via hash and Bearer tokens
  - Swagger/OpenAPI documentation

## Prerequisites

- Node.js 18.x or higher
- Todoist account and API token
- OpenAI API key
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mcclowes/what-the-fpl-api.git
   cd mcclowes-apis
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your credentials:
   ```env
   TODOIST_TOKEN='your_todoist_api_token'
   OPENAI_KEY='your_openai_api_key'
   HASH='your_hash_for_api_authentication'
   CRON_SECRET='your_cron_secret_for_scheduled_jobs'

   # Optional - customize project IDs
   PROJECT_ID_INBOX='your_inbox_project_id'
   PROJECT_ID_FOCUSED='your_focused_project_id'
   PROJECT_ID_WORK='your_work_project_id'
   ```

## Getting Your API Keys

### Todoist API Token
1. Go to [Todoist Settings → Integrations](https://todoist.com/prefs/integrations)
2. Scroll to "API token" section
3. Copy your token

### OpenAI API Key
1. Visit [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Create a new secret key
3. Copy and save it securely

## Available API Endpoints

### Public Endpoints

| Endpoint | Description | Authentication |
|----------|-------------|----------------|
| `GET /` | API health check | None |
| `GET /todos` | Get all todos | None |
| `GET /todos/due` | Get todos that are due | None |
| `GET /todos/summarize` | AI summary of your tasks | None |
| `GET /api-docs` | Interactive API documentation | Hash (query param) |

### Cron Job Endpoints (Require Bearer Token)

| Endpoint | Description | Function |
|----------|-------------|----------|
| `GET /todos/process/reprioritize` | Increase urgency and cleanup | Auto-bumps old due tasks |
| `GET /todos/process/stale` | Complete stale tasks | Completes tasks 250+ days old |
| `GET /todos/process/new-day` | Reset daily focus | Moves focused tasks back to inbox |
| `GET /todos/process/new-day-focus` | Set new focus | Selects top 5 priority tasks |
| `GET /todos/process/categorize` | Auto-categorize tasks | Uses GPT-4 to label tasks |

### Authentication

**Hash Authentication** (for Swagger docs):
```
GET /api-docs?hash=your_hash_here
```

**Bearer Token** (for cron jobs):
```bash
curl -H "Authorization: Bearer your_cron_secret" \
  https://api.mcclowes.com/todos/process/reprioritize
```

## Development

**Run development server** (with hot reload):
```bash
npm run dev
```

**Format code**:
```bash
npm run format
```

**Run tests**:
```bash
npm test
```

## Production Deployment

### Vercel (Recommended)

This project is configured for Vercel deployment:

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel --prod
   ```

3. Set environment variables in Vercel dashboard

### Manual Deployment

```bash
npm run start
```

## Project Structure

```
mcclowes-apis/
├── api/
│   ├── todoist/
│   │   ├── client.js       # Singleton Todoist API client
│   │   ├── gpt.js          # OpenAI integration
│   │   ├── index.js        # Main Todoist service
│   │   └── utils.js        # Helper functions
│   ├── errors/
│   │   ├── AppError.js     # Custom error classes
│   │   └── errorHandler.js # Express error middleware
│   ├── middleware/
│   │   └── validation.js   # Input validation
│   └── docs/
│       └── swagger.js      # API documentation
├── index.js                # Express server setup
├── package.json
├── vercel.json
└── .env.example
```

## Tech Stack

**Runtime**: Node.js 18.x
**Framework**: Express.js
**APIs**:
- Todoist API (@doist/todoist-api-typescript)
- OpenAI API (GPT-3.5 Turbo, GPT-4)

**Documentation**: Swagger/OpenAPI
**Transpiler**: Babel
**CI/CD**: CircleCI
**Deployment**: Vercel

## Environment Variables

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `TODOIST_TOKEN` | Yes | Todoist API token | - |
| `OPENAI_KEY` | Yes | OpenAI API key | - |
| `HASH` | No | API authentication hash | - |
| `CRON_SECRET` | No | Cron job Bearer token | - |
| `PROJECT_ID_INBOX` | No | Inbox project ID | `2254468009` |
| `PROJECT_ID_FOCUSED` | No | Focused project ID | `2299051453` |
| `PROJECT_ID_WORK` | No | Work project ID | `2304777035` |
| `PORT` | No | Server port | `3000` |

## Recent Improvements

- ✅ Updated all dependencies to latest stable versions
- ✅ Replaced deprecated `@babel/polyfill` with `core-js` and `regenerator-runtime`
- ✅ Removed unused `axios` and `uuid4` dependencies
- ✅ Moved hardcoded project IDs to environment variables
- ✅ Fixed duplicate TodoistApi client initialization (singleton pattern)
- ✅ Updated CircleCI to Node 18.x
- ✅ Added comprehensive input validation
- ✅ Improved error handling and security

## License

ISC

## Author

[mcclowes](https://github.com/mcclowes)

## Issues

Report issues at: https://github.com/mcclowes/what-the-fpl-api/issues
