export const summarize = async () => {
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

export const categorize = async () => {
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