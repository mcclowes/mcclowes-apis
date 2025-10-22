/**
 * Swagger API Documentation endpoint
 * GET /api/api-docs
 *
 * Serves a lightweight Swagger UI using CDN
 */
export default async function handler(req, res) {
  const openApiSpec = {
    openapi: '3.0.0',
    info: {
      title: 'McClowes API Documentation',
      version: '1.1.0',
      description: 'API documentation for McClowes Todoist integration',
    },
    servers: [
      {
        url: '/',
        description: 'Current server',
      },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'query',
          name: 'hash',
          description: 'API key for authentication',
        },
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          description: 'Cron job authentication token',
        },
      },
    },
    security: [{ ApiKeyAuth: [] }],
    paths: {
      '/api': {
        get: {
          summary: 'Health check',
          description: 'Check if the API is running',
          tags: ['General'],
          responses: {
            200: {
              description: 'API is running',
            },
          },
        },
      },
      '/api/todos': {
        get: {
          summary: 'Get all todos',
          description: 'Retrieves all todos from Todoist',
          tags: ['Todos'],
          responses: {
            200: {
              description: 'List of todos retrieved successfully',
            },
          },
        },
      },
      '/api/todos/due': {
        get: {
          summary: 'Get due todos',
          description: 'Retrieves todos that are due soon',
          tags: ['Todos'],
          responses: {
            200: {
              description: 'List of due todos retrieved successfully',
            },
          },
        },
      },
      '/api/todos/summarize': {
        get: {
          summary: 'Summarize todos',
          description: 'Generates a summary of todos using GPT',
          tags: ['Todos'],
          responses: {
            200: {
              description: 'Todos summarized successfully',
            },
          },
        },
      },
      '/api/todos/process/categorize': {
        get: {
          summary: 'Categorize todos',
          description: 'Uses GPT to categorize todos',
          tags: ['Processing'],
          security: [{ BearerAuth: [] }],
          responses: {
            200: {
              description: 'Todos categorized successfully',
            },
          },
        },
      },
      '/api/todos/process/reprioritize': {
        get: {
          summary: 'Reprioritize todos',
          description: 'Increases urgency of todos and processes old ones',
          tags: ['Processing'],
          security: [{ BearerAuth: [] }],
          responses: {
            200: {
              description: 'Todos reprioritized successfully',
            },
          },
        },
      },
      '/api/todos/process/stale': {
        get: {
          summary: 'Process stale todos',
          description: 'Identifies and processes todos that are stale',
          tags: ['Processing'],
          security: [{ BearerAuth: [] }],
          responses: {
            200: {
              description: 'Stale todos processed successfully',
            },
          },
        },
      },
      '/api/todos/process/new-day': {
        get: {
          summary: 'Process new day',
          description: 'Moves todos from focused project to inbox',
          tags: ['Processing'],
          security: [{ BearerAuth: [] }],
          responses: {
            200: {
              description: 'New day processed successfully',
            },
          },
        },
      },
      '/api/todos/process/new-day-focus': {
        get: {
          summary: 'Set new day focus',
          description: 'Selects and moves top 5 priority todos to focused project',
          tags: ['Processing'],
          security: [{ BearerAuth: [] }],
          responses: {
            200: {
              description: 'New focus set successfully',
            },
          },
        },
      },
    },
  };

  // If requesting JSON spec
  if (req.query.format === 'json') {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(openApiSpec);
    return;
  }

  // Otherwise, serve Swagger UI
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>McClowes API Documentation</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.10.0/swagger-ui.css" />
  <style>
    body { margin: 0; padding: 0; }
    .topbar { display: none !important; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.10.0/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.10.0/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      const spec = ${JSON.stringify(openApiSpec)};

      window.ui = SwaggerUIBundle({
        spec: spec,
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout",
        persistAuthorization: true,
        displayRequestDuration: true,
      });
    };
  </script>
</body>
</html>
  `;

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(html);
}
