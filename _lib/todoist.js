import { TodoistApi } from "@doist/todoist-api-typescript";
import { ExternalServiceError } from "./errors.js";

/**
 * Gets a Todoist API client instance
 * Uses a singleton pattern to avoid creating multiple instances
 * @returns {TodoistApi} Todoist API client
 */
let apiInstance = null;

export const getTodoistApi = () => {
  if (!apiInstance) {
    if (!process.env.TODOIST_TOKEN) {
      throw new ExternalServiceError("TODOIST_TOKEN is not configured");
    }
    apiInstance = new TodoistApi(process.env.TODOIST_TOKEN);
  }
  return apiInstance;
};
