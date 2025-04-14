import fetch from "node-fetch";
import uuid4 from "uuid4";

//const NTFY_URL = "https://ntfy.sh/mcclowes_api";

export const PROJECT_ID_INBOX = "2254468009";
export const PROJECT_ID_FOCUSED = "2299051453";
export const PROJECT_ID_WORK = "2304777035";

/**
 * Converts days to milliseconds
 * @param {number} days - Number of days
 * @returns {number} Milliseconds equivalent to the days
 */
const getTime = (days) => {
  return 1000 * 3600 * 24 * days;
};

/**
 * Fetches all labels from the Todoist API
 * @param {Object} api - Todoist API client
 * @returns {Promise<Array>} Array of labels
 */
export const getLabels = async (api) => {
  try {
    return await api.getLabels();
  } catch (error) {
    console.error("Error fetching labels:", error);
    return [];
  }
};

/**
 * Helper function to safely fetch tasks from the API
 * @param {Object} api - Todoist API client
 * @param {Object} params - Parameters for the API call
 * @returns {Promise<Array>} Array of tasks
 */
const fetchTasks = async (api, params = {}) => {
  try {
    return await api.getTasks(params);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }
};

/**
 * Fetches all todos from the Todoist API
 * @param {Object} api - Todoist API client
 * @returns {Promise<Array>} Array of todos
 */
export const getTodosAll = async (api) => {
  return await fetchTasks(api);
};

/**
 * Fetches todos from a specific project
 * @param {Object} api - Todoist API client
 * @param {string} project - Project ID
 * @returns {Promise<Array>} Array of todos
 */
export const getTodos = async (api, project = PROJECT_ID_INBOX) => {
  return await fetchTasks(api, { project_id: project });
};

/**
 * Fetches todo content from all todos
 * @param {Object} api - Todoist API client
 * @returns {Promise<Array>} Array of todo content strings
 */
export const getTodosContent = async (api) => {
  const todos = await fetchTasks(api);
  return todos.map((todo) => todo.content);
};

/**
 * Fetches todos that are due and meet priority criteria
 * @param {Object} api - Todoist API client
 * @param {boolean} full - Whether to return full todo objects or just content
 * @param {number} minPriority - Minimum priority to include
 * @returns {Promise<Array>} Array of todos or todo content
 */
export const getTodosDue = async (api, full = false, minPriority = 0) => {
  const data = await fetchTasks(api);

  return data
    .filter((todo) => !!todo?.due)
    .filter((todo) => new Date(todo.due.date) < Date.now())
    .filter((todo) => todo?.priority > minPriority)
    .map((todo) => (full ? todo : todo.content));
};

/**
 * Completes a todo and adds a comment
 * @param {Object} api - Todoist API client
 * @param {Object} todo - Todo object
 * @returns {Promise<boolean>} Success status
 */
const completeTodo = async (api, todo) => {
  try {
    await api.closeTask(todo.id);
    
    await api.addComment({
      taskId: todo.id,
      content: "Completed via api.mcclowes.com",
    });
    
    return true;
  } catch (error) {
    console.error(`Error completing todo ${todo.id}:`, error);
    return false;
  }
};

/**
 * Increases the priority of a todo and sets it due today
 * @param {Object} api - Todoist API client
 * @param {Object} todo - Todo object
 * @returns {Promise<boolean>} Success status
 */
const bumpPriority = async (api, todo) => {
  try {
    await api.updateTask(todo.id, {
      priority: Math.min(4, todo.priority + 1),
      dueString: "today",
    });

    await api.addComment({
      taskId: todo.id,
      content: "Updated via api.mcclowes.com",
    });
    
    return true;
  } catch (error) {
    console.error(`Error bumping priority for todo ${todo.id}:`, error);
    return false;
  }
};

/**
 * Increases the priority of multiple todos
 * @param {Object} api - Todoist API client
 * @param {Array} todos - Array of todo objects
 * @returns {Promise<Array>} Array of success statuses
 */
export const bumpPriorities = async (api, todos) => {
  if (!todos || todos.length === 0) return [];

  // Use Promise.all to properly handle async operations
  return await Promise.all(
    todos.map(async (todo) => {
      return await bumpPriority(api, todo);
    })
  );
};

/**
 * Completes todos that are old and have low priority
 * @param {Object} api - Todoist API client
 * @returns {Promise<string>} Status message
 */
export const killOld = async (api) => {
  const data = await fetchTasks(api);

  const todosDue = data
    .filter((todo) => !todo?.due?.isRecurring)
    .filter((todo) => new Date(todo.createdAt) < Date.now() - getTime(250))
    .filter((todo) => todo?.priority > 1);

  const results = await Promise.all(
    todosDue.map(async (todo) => {
      return await completeTodo(api, todo);
    })
  );

  const successCount = results.filter(Boolean).length;

  return `Completed ${successCount} old todos`;
};

/**
 * Increases urgency of overdue todos
 * @param {Object} api - Todoist API client
 * @returns {Promise<string>} Status message
 */
export const increaseUrgency = async (api) => {
  const data = await fetchTasks(api);

  const todosDue = data
    .filter((todo) => !!todo?.due)
    .filter((todo) => !todo?.due?.isRecurring)
    .filter((todo) => new Date(todo.due.date) < Date.now() - getTime(8))
    .filter((todo) => todo?.priority < 4);

  const results = await bumpPriorities(api, todosDue);
  const successCount = results.filter(Boolean).length;

  return `Increased urgency for ${successCount} todos`;
};

/**
 * Moves todos to a different project
 * @param {Array} todos - Array of todo objects
 * @param {string} project - Project ID
 * @returns {Promise<Object>} API response
 */
export const moveToProject = async (todos, project = PROJECT_ID_INBOX) => {
  if (!todos || todos.length === 0) {
    return { status: "no_todos" };
  }

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

  try {
    const response = await fetch("https://api.todoist.com/sync/v9/sync", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.TODOIST_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    
    return await response.json();
  } catch (error) {
    console.error("Error moving todos to project:", error);
    return { status: "error", message: error.message };
  }
};
