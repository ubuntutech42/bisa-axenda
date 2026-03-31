const { validateAdminArgs } = require('firebase-admin/data-connect');

const connectorConfig = {
  connector: 'axendaConnector',
  serviceId: 'bisa-axenda',
  location: 'southamerica-east1'
};
exports.connectorConfig = connectorConfig;

function createTask(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('CreateTask', inputVars, inputOpts);
}
exports.createTask = createTask;

function createGoal(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('CreateGoal', inputVars, inputOpts);
}
exports.createGoal = createGoal;

function listMyTasks(dcOrOptions, options) {
  const { dc: dcInstance, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrOptions, options, undefined);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('ListMyTasks', undefined, inputOpts);
}
exports.listMyTasks = listMyTasks;

function listMyGoals(dcOrOptions, options) {
  const { dc: dcInstance, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrOptions, options, undefined);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('ListMyGoals', undefined, inputOpts);
}
exports.listMyGoals = listMyGoals;

