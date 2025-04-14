import { TodoistApi } from "@doist/todoist-api-typescript";
import { Configuration, OpenAIApi } from "openai";
import { getTodosDue } from "./utils";

export const summarize = async () => {
  const api = new TodoistApi(process.env.TODOIST_TOKEN);

  const todos = await getTodosDue(api, false, 3);

  const configuration = new Configuration({
    apiKey: process.env.OPENAI_KEY,
  });

  const openai = new OpenAIApi(configuration);

  const prompt = `This is my todo list in a JSON format:
    ${todos}

    The tasks due most imminently are at the top of the list.

    My priority is my health, and completing tasks that are likely to be quick to complete.

    Can you summarise my todo list? Please pull out the key themes of the list, with an example for each.

    Then, please suggest the first three tasks I may wish to tackle.

    Please answer in only 120 tokens.
  `;

  const messages = [
    {
      role: "system",
      content: `
    You are a helpful personal assistant. 
    Your key role is helping me understand my day and make sense of my priorities.
    I trust your judgement when it comes to executive summaries, as I will ultimately double-check your suggestions.
    When answering, don't repeat elements of the prompt, as the answer should be easy to read.
    `,
    },
    {
      role: "system",
      content: `
    Your summarization should take the following structure...
    
    Key themes:
    - theme - example
    - theme - example

    Key tasks:
    - task
    - task
    - task
    `,
    },
    { role: "user", content: prompt },
  ];

  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: messages,
    temperature: 0.8,
    presence_penalty: 0.2,
    max_tokens: 120,
  });

  return response.data.choices[0].message.content;
};

const invalidLabels = [
  "✅_streak",
  "Easy",
  "Medium",
  "Hard",
  "reclaim",
  "Year",
  "Goal",
  "someone_else",
  "Reclaim_personal",
];

const addLabel = async (todo, label, validLabels) => {
  const apiTodoist = new TodoistApi(process.env.TODOIST_TOKEN);

  const labelProcessed = label.replace(/[^\w\s]/gi, "");

  if (
    label === "null" ||
    validLabels.map((label) => label.name).indexOf(labelProcessed) === -1
  ) {
    return false;
  }

  await apiTodoist
    .updateTask(todo.id, {
      labels: [...todo.labels, labelProcessed],
    })
    .catch((error) => console.log(error));

  await apiTodoist
    .addComment({
      taskId: todo.id,
      content: "Updated via api.mcclowes.com",
    })
    .catch((error) => console.log(error));

  return true;
};

const categorizeTask = async (todo, validLabels) => {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_KEY,
  });

  const openai = new OpenAIApi(configuration);

  const messages = [
    {
      role: "system",
      content: `You are a helpful personal assistant. Your job is to categorize items in todolists.`,
    },
    {
      role: "system",
      content: `
    You must always respond with a one word answer.

    The only words you can say are: ${validLabels
      .map((label) => label.name)
      .join(", ")}, null.

    If you're very uncertain, just respond 'null'.
    `,
    },
    {
      role: "user",
      content: `I will give you a task from my todolist, and I want you to think of a word corresponding with that task. What is an appropriate word for the following task: ${todo.content}`,
    },
  ];

  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: messages,
    temperature: 0.8,
    presence_penalty: 0.2,
    max_tokens: 3,
  });

  const label = response.data.choices[0].message.content;

  await addLabel(todo, label, validLabels);
};

const categorizeTasks = async (todos, validLabels) => {
  return Promise.all(todos.map((todo) => categorizeTask(todo, validLabels)));
};

export const categorize = async (tasks = null) => {
  const api = new TodoistApi(process.env.TODOIST_TOKEN);
  
  // If no tasks provided, fetch them from Todoist
  let tasksToCategorize = tasks;
  if (!tasks) {
    const todos = await getTodosDue(api, true, 0);
    tasksToCategorize = todos
      ?.filter((todo) => todo.labels?.length <= 1)
      .filter((todo, i) => i <= 15);
  }

  const labels = await getLabels();
  const validLabels = labels.filter(
    (label) => invalidLabels.indexOf(label.name) === -1
  );

  // Use the latest OpenAI API
  const { OpenAI } = require('openai');
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_KEY,
  });

  // Prepare the tasks for categorization
  const tasksForPrompt = tasksToCategorize.map(task => ({
    id: task.id,
    content: task.content,
    due: task.due ? task.due.date : null,
    priority: task.priority
  }));

  // Define the function for structured output
  const categorizeFunction = {
    name: "categorize_tasks",
    description: "Categorize tasks with appropriate labels",
    parameters: {
      type: "object",
      properties: {
        categorized_tasks: {
          type: "array",
          description: "List of tasks with their assigned categories",
          items: {
            type: "object",
            properties: {
              task_id: {
                type: "string",
                description: "The ID of the task"
              },
              content: {
                type: "string",
                description: "The content of the task"
              },
              category: {
                type: "string",
                description: "The category assigned to the task",
                enum: validLabels.map(label => label.name)
              },
              confidence: {
                type: "number",
                description: "Confidence score for the categorization (0-1)",
                minimum: 0,
                maximum: 1
              },
              reasoning: {
                type: "string",
                description: "Brief explanation of why this category was chosen"
              }
            },
            required: ["task_id", "content", "category", "confidence"]
          }
        }
      },
      required: ["categorized_tasks"]
    }
  };

  // Create the prompt for the model
  const prompt = `I have a list of tasks that need to be categorized. 
  Please analyze each task and assign it to the most appropriate category from the available labels.
  
  Available categories: ${validLabels.map(label => label.name).join(', ')}
  
  Consider the task content, due date, and priority when making your decision.
  If a task doesn't clearly fit into any category, choose the best match and provide a low confidence score.
  
  Tasks to categorize:
  ${JSON.stringify(tasksForPrompt, null, 2)}`;

  // Call the OpenAI API with function calling
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "You are a task categorization assistant. Your job is to analyze tasks and assign them to the most appropriate categories based on their content and context."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    functions: [categorizeFunction],
    function_call: { name: "categorize_tasks" },
    temperature: 0.3,
  });

  // Parse the function call response
  const functionResponse = JSON.parse(response.choices[0].message.function_call.arguments);
  
  // If tasks were provided as input, just return the categorization
  if (tasks) {
    return functionResponse;
  }
  
  // Otherwise, update the tasks in Todoist with their new labels
  const results = await Promise.all(
    functionResponse.categorized_tasks.map(async (categorizedTask) => {
      const task = tasksToCategorize.find(t => t.id === categorizedTask.task_id);
      if (task && categorizedTask.confidence > 0.3) {
        await addLabel(task, categorizedTask.category, validLabels);
        return {
          task_id: categorizedTask.task_id,
          content: categorizedTask.content,
          category: categorizedTask.category,
          confidence: categorizedTask.confidence,
          applied: true
        };
      }
      return {
        task_id: categorizedTask.task_id,
        content: categorizedTask.content,
        category: categorizedTask.category,
        confidence: categorizedTask.confidence,
        applied: false
      };
    })
  );

  return {
    categorized_tasks: results,
    total_tasks: tasksToCategorize.length,
    tasks_categorized: results.filter(r => r.applied).length
  };
};
