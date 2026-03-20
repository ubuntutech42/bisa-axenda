import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

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

interface ListMyTasksRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListMyTasksData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListMyTasksData, undefined>;
  operationName: string;
}
export const listMyTasksRef: ListMyTasksRef;

export function listMyTasks(): QueryPromise<ListMyTasksData, undefined>;
export function listMyTasks(dc: DataConnect): QueryPromise<ListMyTasksData, undefined>;

interface ListMyGoalsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListMyGoalsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListMyGoalsData, undefined>;
  operationName: string;
}
export const listMyGoalsRef: ListMyGoalsRef;

export function listMyGoals(): QueryPromise<ListMyGoalsData, undefined>;
export function listMyGoals(dc: DataConnect): QueryPromise<ListMyGoalsData, undefined>;

interface CreateTaskRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateTaskVariables): MutationRef<CreateTaskData, CreateTaskVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateTaskVariables): MutationRef<CreateTaskData, CreateTaskVariables>;
  operationName: string;
}
export const createTaskRef: CreateTaskRef;

export function createTask(vars: CreateTaskVariables): MutationPromise<CreateTaskData, CreateTaskVariables>;
export function createTask(dc: DataConnect, vars: CreateTaskVariables): MutationPromise<CreateTaskData, CreateTaskVariables>;

interface CreateGoalRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateGoalVariables): MutationRef<CreateGoalData, CreateGoalVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateGoalVariables): MutationRef<CreateGoalData, CreateGoalVariables>;
  operationName: string;
}
export const createGoalRef: CreateGoalRef;

export function createGoal(vars: CreateGoalVariables): MutationPromise<CreateGoalData, CreateGoalVariables>;
export function createGoal(dc: DataConnect, vars: CreateGoalVariables): MutationPromise<CreateGoalData, CreateGoalVariables>;

