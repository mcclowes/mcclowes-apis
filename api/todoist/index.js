import fetch from 'node-fetch';

import { TodoistApi } from '@doist/todoist-api-typescript'

const todoist = () => {};

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

const todoBumpPriority = async (todo) => {
  const api = new TodoistApi(process.env.TODOIST_TOKEN)

  await api.updateTask(
    todo.id, 
    { 
      priority: Math.min(1, todo.priority - 1),
      dueString: "today",
    }
  )
    .then((isSuccess) => console.log(isSuccess))
    .catch((error) => console.log(error))
}

const todoComplete = async (todo) => {
  await api.closeTask(todo.id)
    .then((isSuccess) => console.log(isSuccess))
    .catch((error) => console.log(error))
}

todoist.reprioritise = async () => {
  const api = new TodoistApi(process.env.TODOIST_TOKEN)

  const data = await api.getTasks()
    .then((tasks) => { return tasks })
    .catch((error) => console.log(error))

  const todosDue = data
    .filter(todo => !!todo?.due)
    .filter(todo => !todo?.due?.isRecurring)
    .filter(todo => new Date(todo.due.date) < Date.now() - 12096e5) // 2 weeks ago
    .filter(todo => todo?.priority > 1)

  todosDue.forEach(todo => {
    bumpPriority(todo)
  })

  return "DONE"
};

todoist.killOld = async () => {
  const api = new TodoistApi(process.env.TODOIST_TOKEN)

  const data = await api.getTasks()
    .then((tasks) => { return tasks })
    .catch((error) => console.log(error))

  const todosDue = data
    .filter(todo => !!todo?.due)
    .filter(todo => !todo?.due?.isRecurring)
    .filter(todo => new Date(todo.createdAt) < Date.now() - (1000 * 3600 * 24 * 200)) // 1 year ago
    .filter(todo => todo?.priority > 1)
  
  todosDue.forEach(todo => {
    todoComplete(todo)
  })

  console.log(todosDue)

  return "DONE"
};


export default todoist;