import { ConnectorConfig, DataConnect, OperationOptions, ExecuteOperationResponse } from 'firebase-admin/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;


export interface BusinessActivity_Key {
  id: UUIDString;
  __typename?: 'BusinessActivity_Key';
}

export interface CreateGoalData {
  goal_insert: Goal_Key;
}

export interface CreateGoalVariables {
  title: string;
  dueDate: DateString;
  status: string;
  description?: string | null;
  category?: string | null;
}

export interface CreateTaskData {
  task_insert: Task_Key;
}

export interface CreateTaskVariables {
  description: string;
  status: string;
  dueDate?: DateString | null;
  priority?: string | null;
}

export interface Goal_Key {
  id: UUIDString;
  __typename?: 'Goal_Key';
}

export interface ListMyGoalsData {
  goals: ({
    id: UUIDString;
    title: string;
    status: string;
    dueDate: DateString;
    createdAt: TimestampString;
    description?: string | null;
    category?: string | null;
  } & Goal_Key)[];
}

export interface ListMyTasksData {
  tasks: ({
    id: UUIDString;
    description: string;
    status: string;
    createdAt: TimestampString;
    dueDate?: DateString | null;
    priority?: string | null;
  } & Task_Key)[];
}

export interface Project_Key {
  id: UUIDString;
  __typename?: 'Project_Key';
}

export interface Routine_Key {
  id: UUIDString;
  __typename?: 'Routine_Key';
}

export interface Task_Key {
  id: UUIDString;
  __typename?: 'Task_Key';
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

/** Generated Node Admin SDK operation action function for the 'CreateTask' Mutation. Allow users to execute without passing in DataConnect. */
export function createTask(dc: DataConnect, vars: CreateTaskVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateTaskData>>;
/** Generated Node Admin SDK operation action function for the 'CreateTask' Mutation. Allow users to pass in custom DataConnect instances. */
export function createTask(vars: CreateTaskVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateTaskData>>;

/** Generated Node Admin SDK operation action function for the 'CreateGoal' Mutation. Allow users to execute without passing in DataConnect. */
export function createGoal(dc: DataConnect, vars: CreateGoalVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateGoalData>>;
/** Generated Node Admin SDK operation action function for the 'CreateGoal' Mutation. Allow users to pass in custom DataConnect instances. */
export function createGoal(vars: CreateGoalVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateGoalData>>;

/** Generated Node Admin SDK operation action function for the 'ListMyTasks' Query. Allow users to execute without passing in DataConnect. */
export function listMyTasks(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<ListMyTasksData>>;
/** Generated Node Admin SDK operation action function for the 'ListMyTasks' Query. Allow users to pass in custom DataConnect instances. */
export function listMyTasks(options?: OperationOptions): Promise<ExecuteOperationResponse<ListMyTasksData>>;

/** Generated Node Admin SDK operation action function for the 'ListMyGoals' Query. Allow users to execute without passing in DataConnect. */
export function listMyGoals(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<ListMyGoalsData>>;
/** Generated Node Admin SDK operation action function for the 'ListMyGoals' Query. Allow users to pass in custom DataConnect instances. */
export function listMyGoals(options?: OperationOptions): Promise<ExecuteOperationResponse<ListMyGoalsData>>;

