import fetch from 'node-fetch';

import { TodoistApi } from '@doist/todoist-api-typescript'

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

todoist.getTodosDue = async () => {
  const api = new TodoistApi(process.env.TODOIST_TOKEN)

  const data = await api.getTasks()
    .then((tasks) => { return tasks })
    .catch((error) => console.log(error))

  const todosDue = data
    .filter(todo => !!todo?.due )
    .filter(todo => new Date(todo.due.date) < Date.now())
    .map(todo => todo.content)

  return todosDue
};

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

export default todoist;