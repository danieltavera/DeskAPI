const listResources = require('../../use-cases/listResources');
const createResource = require('../../use-cases/createResource');
const updateResource = require('../../use-cases/updateResource');
const deleteResource = require('../../use-cases/deleteResource');
const AppError = require('../../use-cases/AppError');
const { logEvent } = require('../../infrastructure/http/activityLogger');

function handleError(err, res) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }
  console.error(err);
  return res.status(500).json({ message: 'Internal server error' });
}

async function list(req, res) {
  try {
    const resources = await listResources();
    res.json(resources);
  } catch (err) {
    handleError(err, res);
  }
}

async function create(req, res) {
  try {
    const resource = await createResource(req.body, req.user);
    logEvent('resource_created', req.user.sub, `Resource "${resource.name}" created`);
    res.status(201).json(resource);
  } catch (err) {
    handleError(err, res);
  }
}

async function update(req, res) {
  try {
    const resource = await updateResource(req.params.id, req.body, req.user);
    res.json(resource);
  } catch (err) {
    handleError(err, res);
  }
}

async function remove(req, res) {
  try {
    await deleteResource(req.params.id, req.user);
    res.status(204).send();
  } catch (err) {
    handleError(err, res);
  }
}

module.exports = { list, create, update, remove };
