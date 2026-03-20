import { ListMyTasksData, ListMyGoalsData, CreateTaskData, CreateTaskVariables, CreateGoalData, CreateGoalVariables } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useListMyTasks(options?: useDataConnectQueryOptions<ListMyTasksData>): UseDataConnectQueryResult<ListMyTasksData, undefined>;
export function useListMyTasks(dc: DataConnect, options?: useDataConnectQueryOptions<ListMyTasksData>): UseDataConnectQueryResult<ListMyTasksData, undefined>;

export function useListMyGoals(options?: useDataConnectQueryOptions<ListMyGoalsData>): UseDataConnectQueryResult<ListMyGoalsData, undefined>;
export function useListMyGoals(dc: DataConnect, options?: useDataConnectQueryOptions<ListMyGoalsData>): UseDataConnectQueryResult<ListMyGoalsData, undefined>;

export function useCreateTask(options?: useDataConnectMutationOptions<CreateTaskData, FirebaseError, CreateTaskVariables>): UseDataConnectMutationResult<CreateTaskData, CreateTaskVariables>;
export function useCreateTask(dc: DataConnect, options?: useDataConnectMutationOptions<CreateTaskData, FirebaseError, CreateTaskVariables>): UseDataConnectMutationResult<CreateTaskData, CreateTaskVariables>;

export function useCreateGoal(options?: useDataConnectMutationOptions<CreateGoalData, FirebaseError, CreateGoalVariables>): UseDataConnectMutationResult<CreateGoalData, CreateGoalVariables>;
export function useCreateGoal(dc: DataConnect, options?: useDataConnectMutationOptions<CreateGoalData, FirebaseError, CreateGoalVariables>): UseDataConnectMutationResult<CreateGoalData, CreateGoalVariables>;
