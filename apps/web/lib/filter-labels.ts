export const TASK_STATUS_LABELS: Record<string, string> = {
  "": "Status",
  ALL: "Status",
  TODO: "Todo",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
}

export const TASK_PRIORITY_LABELS: Record<string, string> = {
  "": "Priority",
  ALL: "Priority",
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
}

export const TASK_DEADLINE_LABELS: Record<string, string> = {
  "": "Deadline",
  ALL: "Deadline",
  upcoming: "Due this week",
  overdue: "Overdue",
}

export const TASK_SORT_LABELS: Record<string, string> = {
  createdAt_desc: "Latest created",
  dueDate_asc: "Nearest deadline",
  priority_desc: "Highest priority",
  updatedAt_desc: "Recently updated",
}

export const PROJECT_STATUS_LABELS: Record<string, string> = {
  "": "Status",
  ALL: "Status",
  ACTIVE: "Active",
  ON_HOLD: "On Hold",
  COMPLETED: "Completed",
}

export const PROJECT_SORT_LABELS: Record<string, string> = {
  createdAt_desc: "Latest created",
  createdAt_asc: "Oldest first",
  deadline_asc: "Nearest deadline",
  name_asc: "Name A-Z",
}
