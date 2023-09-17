import fetch from 'node-fetch';

import { TodoistApi } from '@doist/todoist-api-typescript'
import { Configuration, OpenAIApi } from "openai";

import uuid4 from "uuid4";

const PROJECT_ID_INBOX = "2254468009"
const PROJECT_ID_FOCUSED = "2299051453"

const todoist = () => {};

const getTime = days => { return 1000 * 3600 * 24 * days }

const getLabels = async (api) => {
  const labels = await api.getLabels()
    .then((labels) => { return labels })
    .catch((error) => console.log(error))

  return labels
};

const getTodos = async (api) => {
  const todos = await api.getTasks()
    .then((tasks) => { return tasks })
    .catch((error) => console.log(error))

  return todos
};

todoist.getTodos = () => {
  const api = new TodoistApi(process.env.TODOIST_TOKEN)

  return getTodos(api)
};

const getTodosFocused = async (api) => {
  const todos = await api.getTasks({ project_id: PROJECT_ID_FOCUSED })
    .then((tasks) => { return tasks })
    .catch((error) => console.log(error))

  return todos
};

const getTodosContent = async (api) => {
  const todos = await api.getTasks()
    .then((tasks) => { return tasks })
    .catch((error) => console.log(error))

  return todos.map(todo => todo.content)
};

const getTodosDue = async (api, full=false, minPriority=0) => {
  const data = await api.getTasks()
    .then((tasks) => { return tasks })
    .catch((error) => console.log(error))

  const todosDue = data
    .filter(todo => !!todo?.due )
    .filter(todo => new Date(todo.due.date) < Date.now())
    .filter(todo => todo?.priority > minPriority)
    .map(todo => full ? todo : todo.content)

  return todosDue
};

todoist.getTodosDue = () => {
  const api = new TodoistApi(process.env.TODOIST_TOKEN)
  
  return getTodosDue(api)
};

const bumpPriority = async (api, todo) => {
  await api.updateTask(
    todo.id, 
    { 
      priority: Math.min(4, todo.priority + 1),
      dueString: "today",
    }
  )
    .catch((error) => console.log(error))

  await api.addComment({
    taskId: todo.id,
    content: "Updated via api.mcclowes.com",
  })
    .catch((error) => console.log(error))
}

const todoComplete = async (api, todo) => {
  await api.closeTask(todo.id)
    .then((isSuccess) => console.log(isSuccess))
    .catch((error) => console.log(error))

  await api.addComment({
    taskId: todo.id,
    content: "Completed via api.mcclowes.com",
  })
    .catch((error) => console.log(error))
}

const killOld = async (api) => {
  const data = await api.getTasks()
    .then((tasks) => { return tasks })
    .catch((error) => console.log(error))

  const todosDue = data
    .filter(todo => !todo?.due?.isRecurring)
    .filter(todo => new Date(todo.createdAt) < Date.now() - getTime(250))
    .filter(todo => todo?.priority > 1)
  
  todosDue.forEach(todo => {
    todoComplete(api, todo)
  })

  return "DONE"
};

todoist.killOld = () => {
  const api = new TodoistApi(process.env.TODOIST_TOKEN)

  return killOld(api);
}

const increaseUrgency = async (api) => {
  const data = await api.getTasks()
    .then((tasks) => { return tasks })
    .catch((error) => console.log(error))

  const todosDue = data
    .filter(todo => !!todo?.due)
    .filter(todo => !todo?.due?.isRecurring)
    .filter(todo => new Date(todo.due.date) < Date.now() - getTime(8))
    .filter(todo => todo?.priority < 4)

  todosDue.forEach(todo => {
    bumpPriority(api, todo)
  })

  return "DONE"
};

const reprioritize = async () => {
  const api = new TodoistApi(process.env.TODOIST_TOKEN)

  const done1 = await increaseUrgency(api)
  const done2 = await killOld(api)
  const done3 = await newDay()

  return done1 + " " + done2 + " " + done3
}

todoist.reprioritize = reprioritize;

const summarize = async () => {
  const api = new TodoistApi(process.env.TODOIST_TOKEN)

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
  `

  const messages = [
    {"role": "system", "content": `
    You are a helpful personal assistant. 
    Your key role is helping me understand my day and make sense of my priorities.
    I trust your judgement when it comes to executive summaries, as I will ultimately double-check your suggestions.
    When answering, don't repeat elements of the prompt, as the answer should be easy to read.
    `},
    {"role": "system", "content": `
    Your summarization should take the following structure...
    
    Key themes:
    - theme - example
    - theme - example

    Key tasks:
    - task
    - task
    - task
    `},
    {"role": "user", "content": prompt},
  ]

  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: messages,
    temperature: 0.8,
    presence_penalty: 0.2,
    max_tokens: 120,
  })

  return response.data.choices[0].message.content;
}

todoist.summarize = summarize;

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
]

const addLabel = async (todo, label, validLabels) => {
  const apiTodoist = new TodoistApi(process.env.TODOIST_TOKEN)

  const labelProcessed = label.replace(/[^\w\s]/gi, '')

  if (label === "null" || validLabels.map(label=>label.name).indexOf(labelProcessed) === -1) { return false }

  await apiTodoist.updateTask(
    todo.id, 
    { 
      labels: [...todo.labels, labelProcessed]
    }
  )
    .catch((error) => console.log(error))

  await apiTodoist.addComment({
    taskId: todo.id,
    content: "Updated via api.mcclowes.com",
  })
    .catch((error) => console.log(error))

  return true
}

const categorizeTask = async (todo, validLabels) => {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_KEY,
  });

  const openai = new OpenAIApi(configuration);

  const messages = [
    {"role": "system", "content": `You are a helpful personal assistant. Your job is to categorize items in todolists.`},
    {"role": "system", "content": `
    You must always respond with a one word answer.

    The only words you can say are: ${validLabels.map(label => label.name).join(", ")}, null.

    If you're very uncertain, just respond 'null'.
    `},
    {"role": "user", "content": `I will give you a task from my todolist, and I want you to think of a word corresponding with that task. What is an appropriate word for the following task: ${todo.content}`},
  ]

  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: messages,
    temperature: 0.8,
    presence_penalty: 0.2,
    max_tokens: 3,
  })

  const label = response.data.choices[0].message.content

  await addLabel(todo, label, validLabels)
}

const categorizeTasks = async (todos, validLabels) => {
  return Promise.all(todos.map(todo => categorizeTask(todo, validLabels)))
}

const categorize = async () => {
  const api = new TodoistApi(process.env.TODOIST_TOKEN)

  const todos = await getTodosDue(api, true, 0)
  const todosToCategorize = todos?.filter(todo => todo.labels?.length <= 1)
    .filter((todo, i) => i <= 15)

  const labels = await getLabels()
  const validLabels = labels
    .filter(label => invalidLabels.indexOf(label.name) === -1)

  const repsonses = await categorizeTasks(todosToCategorize, validLabels)

  return repsonses
}

todoist.categorize = categorize;

const moveToInbox = async (api, todos) => {
  const body = {
    commands: [
      ...todos.map(todo => {
        return {
          type: "item_move",
          args: {
            id: todo.id, 
            "project_id": PROJECT_ID_INBOX 
          },
          uuid: uuid4(),
        }
      })
    ],
  }

  const response = await fetch(
    "https://api.todoist.com/sync/v9/sync",
    {
      method: 'POST',
      headers: {
        "Authorization": `Bearer ${process.env.TODOIST_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  )
    .then((res) => { return res.json() })
    .catch((error) => console.log(error))

  return
}

const newDay = async () => {
  const api = new TodoistApi(process.env.TODOIST_TOKEN)

  const todos = await getTodosFocused(api)

  await moveToInbox(api, todos)

  return 'DONE'
}

todoist.newDay = newDay;

export default todoist;