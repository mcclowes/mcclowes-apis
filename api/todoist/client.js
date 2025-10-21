import { TodoistApi } from "@doist/todoist-api-typescript";
import { ExternalServiceError } from "../errors/AppError";

/**
 * Creates a Todoist API client
 * @returns {TodoistApi} Todoist API client
 * @throws {ExternalServiceError} If TODOIST_TOKEN is not configured
 */
const createTodoistApi = () => {
  if (!process.env.TODOIST_TOKEN) {
    throw new ExternalServiceError("TODOIST_TOKEN is not configured");
  }
  return new TodoistApi(process.env.TODOIST_TOKEN);
};

/**
 * Gets a Todoist API client instance
 * Uses a singleton pattern to avoid creating multiple instances
 * @returns {TodoistApi} Todoist API client
 */
export const getTodoistApi = (() => {
  let apiInstance = null;

  return () => {
    if (!apiInstance) {
      apiInstance = createTodoistApi();
    }
    return apiInstance;
  };
})();
