/**
 * Serviço de acesso ao Data Connect (Axénda).
 *
 * Encapsula chamadas diretas ao SDK gerado para uso em
 * Server Components, Route Handlers ou qualquer lugar sem hooks.
 * Para componentes React, prefira os hooks em
 * '@axenda/dataconnect-web/react' (useListMyTasks, useCreateTask etc).
 */

import {
  listMyTasks,
  listMyGoals,
  createTask,
  createGoal,
} from '@axenda/dataconnect-web';

import type {
  ListMyTasksData,
  ListMyGoalsData,
  CreateTaskVariables,
  CreateGoalVariables,
  CreateTaskData,
  CreateGoalData,
} from '@axenda/dataconnect-web';

// Re-exporta tipos para facilitar imports no resto do app
export type {
  ListMyTasksData,
  ListMyGoalsData,
  CreateTaskVariables,
  CreateGoalVariables,
  CreateTaskData,
  CreateGoalData,
};

/** Lista todas as tasks do usuário autenticado (via auth.uid). */
export async function fetchMyTasks() {
  const { data } = await listMyTasks();
  return data.tasks;
}

/** Lista todas as metas do usuário autenticado. */
export async function fetchMyGoals() {
  const { data } = await listMyGoals();
  return data.goals;
}

/** Cria uma nova task para o usuário autenticado. */
export async function addTask(vars: CreateTaskVariables) {
  const { data } = await createTask(vars);
  return data.task_insert;
}

/** Cria uma nova meta para o usuário autenticado. */
export async function addGoal(vars: CreateGoalVariables) {
  const { data } = await createGoal(vars);
  return data.goal_insert;
}
