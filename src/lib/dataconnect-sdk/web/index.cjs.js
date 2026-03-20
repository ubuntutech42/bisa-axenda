const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'axendaConnector',
  service: 'bisa-axenda',
  location: 'southamerica-east1'
};
exports.connectorConfig = connectorConfig;

const listMyTasksRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListMyTasks');
}
listMyTasksRef.operationName = 'ListMyTasks';
exports.listMyTasksRef = listMyTasksRef;

exports.listMyTasks = function listMyTasks(dc) {
  return executeQuery(listMyTasksRef(dc));
};

const listMyGoalsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListMyGoals');
}
listMyGoalsRef.operationName = 'ListMyGoals';
exports.listMyGoalsRef = listMyGoalsRef;

exports.listMyGoals = function listMyGoals(dc) {
  return executeQuery(listMyGoalsRef(dc));
};

const createTaskRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateTask', inputVars);
}
createTaskRef.operationName = 'CreateTask';
exports.createTaskRef = createTaskRef;

exports.createTask = function createTask(dcOrVars, vars) {
  return executeMutation(createTaskRef(dcOrVars, vars));
};

const createGoalRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateGoal', inputVars);
}
createGoalRef.operationName = 'CreateGoal';
exports.createGoalRef = createGoalRef;

exports.createGoal = function createGoal(dcOrVars, vars) {
  return executeMutation(createGoalRef(dcOrVars, vars));
};
