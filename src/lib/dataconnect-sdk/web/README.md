# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `axendaConnector`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`web/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListMyTasks*](#listmytasks)
  - [*ListMyGoals*](#listmygoals)
- [**Mutations**](#mutations)
  - [*CreateTask*](#createtask)
  - [*CreateGoal*](#creategoal)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `axendaConnector`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@axenda/dataconnect-web` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@axenda/dataconnect-web';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@axenda/dataconnect-web';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `axendaConnector` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListMyTasks
You can execute the `ListMyTasks` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [web/index.d.ts](./index.d.ts):
```typescript
listMyTasks(): QueryPromise<ListMyTasksData, undefined>;

interface ListMyTasksRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListMyTasksData, undefined>;
}
export const listMyTasksRef: ListMyTasksRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listMyTasks(dc: DataConnect): QueryPromise<ListMyTasksData, undefined>;

interface ListMyTasksRef {
  ...
  (dc: DataConnect): QueryRef<ListMyTasksData, undefined>;
}
export const listMyTasksRef: ListMyTasksRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listMyTasksRef:
```typescript
const name = listMyTasksRef.operationName;
console.log(name);
```

### Variables
The `ListMyTasks` query has no variables.
### Return Type
Recall that executing the `ListMyTasks` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListMyTasksData`, which is defined in [web/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ListMyTasks`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listMyTasks } from '@axenda/dataconnect-web';


// Call the `listMyTasks()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listMyTasks();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listMyTasks(dataConnect);

console.log(data.tasks);

// Or, you can use the `Promise` API.
listMyTasks().then((response) => {
  const data = response.data;
  console.log(data.tasks);
});
```

### Using `ListMyTasks`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listMyTasksRef } from '@axenda/dataconnect-web';


// Call the `listMyTasksRef()` function to get a reference to the query.
const ref = listMyTasksRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listMyTasksRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.tasks);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.tasks);
});
```

## ListMyGoals
You can execute the `ListMyGoals` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [web/index.d.ts](./index.d.ts):
```typescript
listMyGoals(): QueryPromise<ListMyGoalsData, undefined>;

interface ListMyGoalsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListMyGoalsData, undefined>;
}
export const listMyGoalsRef: ListMyGoalsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listMyGoals(dc: DataConnect): QueryPromise<ListMyGoalsData, undefined>;

interface ListMyGoalsRef {
  ...
  (dc: DataConnect): QueryRef<ListMyGoalsData, undefined>;
}
export const listMyGoalsRef: ListMyGoalsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listMyGoalsRef:
```typescript
const name = listMyGoalsRef.operationName;
console.log(name);
```

### Variables
The `ListMyGoals` query has no variables.
### Return Type
Recall that executing the `ListMyGoals` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListMyGoalsData`, which is defined in [web/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ListMyGoals`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listMyGoals } from '@axenda/dataconnect-web';


// Call the `listMyGoals()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listMyGoals();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listMyGoals(dataConnect);

console.log(data.goals);

// Or, you can use the `Promise` API.
listMyGoals().then((response) => {
  const data = response.data;
  console.log(data.goals);
});
```

### Using `ListMyGoals`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listMyGoalsRef } from '@axenda/dataconnect-web';


// Call the `listMyGoalsRef()` function to get a reference to the query.
const ref = listMyGoalsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listMyGoalsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.goals);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.goals);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `axendaConnector` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateTask
You can execute the `CreateTask` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [web/index.d.ts](./index.d.ts):
```typescript
createTask(vars: CreateTaskVariables): MutationPromise<CreateTaskData, CreateTaskVariables>;

interface CreateTaskRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateTaskVariables): MutationRef<CreateTaskData, CreateTaskVariables>;
}
export const createTaskRef: CreateTaskRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createTask(dc: DataConnect, vars: CreateTaskVariables): MutationPromise<CreateTaskData, CreateTaskVariables>;

interface CreateTaskRef {
  ...
  (dc: DataConnect, vars: CreateTaskVariables): MutationRef<CreateTaskData, CreateTaskVariables>;
}
export const createTaskRef: CreateTaskRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createTaskRef:
```typescript
const name = createTaskRef.operationName;
console.log(name);
```

### Variables
The `CreateTask` mutation requires an argument of type `CreateTaskVariables`, which is defined in [web/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateTaskVariables {
  description: string;
  status: string;
  dueDate?: DateString | null;
  priority?: string | null;
}
```
### Return Type
Recall that executing the `CreateTask` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateTaskData`, which is defined in [web/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateTaskData {
  task_insert: Task_Key;
}
```
### Using `CreateTask`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createTask, CreateTaskVariables } from '@axenda/dataconnect-web';

// The `CreateTask` mutation requires an argument of type `CreateTaskVariables`:
const createTaskVars: CreateTaskVariables = {
  description: ..., 
  status: ..., 
  dueDate: ..., // optional
  priority: ..., // optional
};

// Call the `createTask()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createTask(createTaskVars);
// Variables can be defined inline as well.
const { data } = await createTask({ description: ..., status: ..., dueDate: ..., priority: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createTask(dataConnect, createTaskVars);

console.log(data.task_insert);

// Or, you can use the `Promise` API.
createTask(createTaskVars).then((response) => {
  const data = response.data;
  console.log(data.task_insert);
});
```

### Using `CreateTask`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createTaskRef, CreateTaskVariables } from '@axenda/dataconnect-web';

// The `CreateTask` mutation requires an argument of type `CreateTaskVariables`:
const createTaskVars: CreateTaskVariables = {
  description: ..., 
  status: ..., 
  dueDate: ..., // optional
  priority: ..., // optional
};

// Call the `createTaskRef()` function to get a reference to the mutation.
const ref = createTaskRef(createTaskVars);
// Variables can be defined inline as well.
const ref = createTaskRef({ description: ..., status: ..., dueDate: ..., priority: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createTaskRef(dataConnect, createTaskVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.task_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.task_insert);
});
```

## CreateGoal
You can execute the `CreateGoal` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [web/index.d.ts](./index.d.ts):
```typescript
createGoal(vars: CreateGoalVariables): MutationPromise<CreateGoalData, CreateGoalVariables>;

interface CreateGoalRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateGoalVariables): MutationRef<CreateGoalData, CreateGoalVariables>;
}
export const createGoalRef: CreateGoalRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createGoal(dc: DataConnect, vars: CreateGoalVariables): MutationPromise<CreateGoalData, CreateGoalVariables>;

interface CreateGoalRef {
  ...
  (dc: DataConnect, vars: CreateGoalVariables): MutationRef<CreateGoalData, CreateGoalVariables>;
}
export const createGoalRef: CreateGoalRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createGoalRef:
```typescript
const name = createGoalRef.operationName;
console.log(name);
```

### Variables
The `CreateGoal` mutation requires an argument of type `CreateGoalVariables`, which is defined in [web/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateGoalVariables {
  title: string;
  dueDate: DateString;
  status: string;
  description?: string | null;
  category?: string | null;
}
```
### Return Type
Recall that executing the `CreateGoal` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateGoalData`, which is defined in [web/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateGoalData {
  goal_insert: Goal_Key;
}
```
### Using `CreateGoal`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createGoal, CreateGoalVariables } from '@axenda/dataconnect-web';

// The `CreateGoal` mutation requires an argument of type `CreateGoalVariables`:
const createGoalVars: CreateGoalVariables = {
  title: ..., 
  dueDate: ..., 
  status: ..., 
  description: ..., // optional
  category: ..., // optional
};

// Call the `createGoal()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createGoal(createGoalVars);
// Variables can be defined inline as well.
const { data } = await createGoal({ title: ..., dueDate: ..., status: ..., description: ..., category: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createGoal(dataConnect, createGoalVars);

console.log(data.goal_insert);

// Or, you can use the `Promise` API.
createGoal(createGoalVars).then((response) => {
  const data = response.data;
  console.log(data.goal_insert);
});
```

### Using `CreateGoal`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createGoalRef, CreateGoalVariables } from '@axenda/dataconnect-web';

// The `CreateGoal` mutation requires an argument of type `CreateGoalVariables`:
const createGoalVars: CreateGoalVariables = {
  title: ..., 
  dueDate: ..., 
  status: ..., 
  description: ..., // optional
  category: ..., // optional
};

// Call the `createGoalRef()` function to get a reference to the mutation.
const ref = createGoalRef(createGoalVars);
// Variables can be defined inline as well.
const ref = createGoalRef({ title: ..., dueDate: ..., status: ..., description: ..., category: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createGoalRef(dataConnect, createGoalVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.goal_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.goal_insert);
});
```

