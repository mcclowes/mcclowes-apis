import fetch from 'node-fetch';

import { TodoistApi } from '@doist/todoist-api-typescript'
import { Configuration, OpenAIApi } from "openai";

const todoist = () => {};

const getTime = days => { return 1000 * 3600 * 24 * days }

todoist.getTodos = async () => {
  const api = new TodoistApi(process.env.TODOIST_TOKEN)

  const todos = await api.getTasks()
    .then((tasks) => { return tasks })
    .catch((error) => console.log(error))

  return todos
};

todoist.getTodosContent = async () => {
  const api = new TodoistApi(process.env.TODOIST_TOKEN)

  const todos = await api.getTasks()
    .then((tasks) => { return tasks })
    .catch((error) => console.log(error))

  return todos.map(todo => todo.content)
};

const getTodosDue = async (minPriority=4) => {
  const api = new TodoistApi(process.env.TODOIST_TOKEN)

  const data = await api.getTasks()
    .then((tasks) => { return tasks })
    .catch((error) => console.log(error))

  const todosDue = data
    .filter(todo => !!todo?.due )
    .filter(todo => new Date(todo.due.date) < Date.now())
    .filter(todo => todo?.priority < 4)
    .map(todo => todo.content)

  return todosDue
};

todoist.getTodosDue = getTodosDue

const bumpPriority = async (api, todo) => {
  await api.updateTask(
    todo.id, 
    { 
      priority: Math.min(4, todo.priority + 1),
      dueString: "today",
    }
  )
    .then((isSuccess) => console.log(isSuccess))
    .catch((error) => console.log(error))

  await api.addComment({
    taskId: todo.id,
    content: "Updated via api.mcclowes.com",
  })
    .then((comment) => console.log(comment))
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
    .then((comment) => console.log(comment))
    .catch((error) => console.log(error))
}

const killOld = async () => {
  const api = new TodoistApi(process.env.TODOIST_TOKEN)

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

todoist.killOld = killOld;

const increaseUrgency = async () => {
  const api = new TodoistApi(process.env.TODOIST_TOKEN)

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

const reprioritise = async () => {
  const done = await increaseUrgency()
  const done2 = await killOld()

  return done + " " + done2
}

todoist.reprioritise = reprioritise;

const summarize = async () => {
  const todos = await getTodosDue(3);

  const prompt = `This is my todo list in a JSON format:
    ${todos}

    The tasks due most imminently are at the top of the list.

    My priority is my health, and completing tasks that are likely to be quick to complete.

    Can you summarise my todo list? Please pull out the key themes of the list, with examples.

    Then, please suggest the first three tasks I may wish to tackle.
  `

  const configuration = new Configuration({
    apiKey: process.env.OPENAI_KEY,
  });

  const openai = new OpenAIApi(configuration);

  const messages = [
    {"role": "system", "content": `
    You are a helpful personal assistant. 
    Your key role is helping me understand my day and make sense of my priorities.
    I trust your judgement when it comes to executive summaries, as I will ultimately double-check your suggestions.
    When answering, don't repeat elements of the prompt, as the answer should be easy to read.
    `},
    {"role": "user", "content": prompt},
  ]

  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: messages,
  })

  return response.data.choices[0].message.content;
}

todoist.summarize = summarize;

export default todoist;