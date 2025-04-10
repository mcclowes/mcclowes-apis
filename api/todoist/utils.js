import fetch from "node-fetch";
import uuid4 from "uuid4";

const NTFY_URL = "https://ntfy.sh/mcclowes_api";

export const PROJECT_ID_INBOX = "2254468009";
export const PROJECT_ID_FOCUSED = "2299051453";
export const PROJECT_ID_WORK = "2304777035";

const getTime = (days) => {
  return 1000 * 3600 * 24 * days;
};

const getLabels = async (api) => {
  const labels = await api
    .getLabels()
    .then((labels) => {
      return labels;
    })
    .catch((error) => console.log(error));

  return labels;
};

export const getTodosAll = async (api) => {
  const todos = await api
    .getTasks()
    .then((tasks) => {
      return tasks;
    })
    .catch((error) => console.log(error));

  return todos;
};

export const getTodos = async (api, project = PROJECT_ID_INBOX) => {
  const todos = await api
    .getTasks({ project_id: project })
    .then((tasks) => {
      return tasks;
    })
    .catch((error) => console.log(error));

  return todos;
};

export const getTodosContent = async (api) => {
  const todos = await api
    .getTasks()
    .then((tasks) => {
      return tasks;
    })
    .catch((error) => console.log(error));

  return todos.map((todo) => todo.content);
};

export const getTodosDue = async (api, full = false, minPriority = 0) => {
  const data = await api
    .getTasks()
    .then((tasks) => {
      return tasks;
    })
    .catch((error) => console.log(error));

  const todosDue = data
    .filter((todo) => !!todo?.due)
    .filter((todo) => new Date(todo.due.date) < Date.now())
    .filter((todo) => todo?.priority > minPriority)
    .map((todo) => (full ? todo : todo.content));

  return todosDue;
};

const completeTodo = async (api, todo) => {
  await api
    .closeTask(todo.id)
    .then((isSuccess) => console.log(isSuccess))
    .catch((error) => console.log(error));

  await api
    .addComment({
      taskId: todo.id,
      content: "Completed via api.mcclowes.com",
    })
    .catch((error) => console.log(error));
};

// export const setDue = async (api, todo) => {
//   await api.updateTask(
//     todo.id,
//     {
//       due_datetime: new Date(),
//     }
//   )
//     .catch((error) => console.log(error))
// }

const bumpPriority = async (api, todo) => {
  await api
    .updateTask(todo.id, {
      priority: Math.min(4, todo.priority + 1),
      dueString: "today",
    })
    .catch((error) => console.log(error));

  await api
    .addComment({
      taskId: todo.id,
      content: "Updated via api.mcclowes.com",
    })
    .catch((error) => console.log(error));
};

export const bumpPriorities = async (api, todos) => {
  if (!todos || todos.length === 0) return [];

  todos.forEach(async (todo) => {
    await bumpPriority(api, todo);
  });
};

export const killOld = async (api) => {
  const data = await api
    .getTasks()
    .then((tasks) => {
      return tasks;
    })
    .catch((error) => console.log(error));

  const todosDue = data
    .filter((todo) => !todo?.due?.isRecurring)
    .filter((todo) => new Date(todo.createdAt) < Date.now() - getTime(250))
    .filter((todo) => todo?.priority > 1);

  todosDue.forEach((todo) => {
    completeTodo(api, todo);
  });

  fetch(NTFY_URL, {
    method: "POST", // PUT works too
    body: "Killed old todos",
    headers: {
      Title: "api.mcclowes.com",
      Priority: "1",
      Tags: "wastebasket",
    },
  });

  return "DONE";
};

export const increaseUrgency = async (api) => {
  const data = await api
    .getTasks()
    .then((tasks) => {
      return tasks;
    })
    .catch((error) => console.log(error));

  const todosDue = data
    .filter((todo) => !!todo?.due)
    .filter((todo) => !todo?.due?.isRecurring)
    .filter((todo) => new Date(todo.due.date) < Date.now() - getTime(8))
    .filter((todo) => todo?.priority < 4);

  bumpPriorities(todosDue);

  return "DONE";
};

export const moveToProject = async (api, todos, project = PROJECT_ID_INBOX) => {
  const body = {
    commands: [
      ...todos.map((todo) => {
        return {
          type: "item_move",
          args: {
            id: todo.id,
            project_id: project,
          },
          uuid: uuid4(),
        };
      }),
    ],
  };

  const response = await fetch("https://api.todoist.com/sync/v9/sync", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.TODOIST_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
    .then((res) => {
      return res.json();
    })
    .catch((error) => console.log(error));

  return;
};
