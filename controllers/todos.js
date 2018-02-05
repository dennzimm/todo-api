const express = require('express');
const { ObjectID } = require('mongodb');
const { pick, isBoolean } = require('lodash');

const { Todo } = require('./../models/todo');

const router = express.Router();

router.post('/', (req, res) => {
  const body = pick(req.body, ['text']);
  const todo = new Todo(body);

  todo
    .save()
    .then(todo => res.send(todo))
    .catch(error => res.status(400).send(error));
});

router.get('/', (req, res) => {
  Todo.find()
    .then(todos => {
      res.send({ todos });
    })
    .catch(error => {
      res.status(400).send(error);
    });
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  const isValidID = ObjectID.isValid(id);

  if (!isValidID) {
    return res.status(404).send();
  }

  Todo.findById(id)
    .then(todo => {
      if (!todo) {
        return res.sendStatus(404);
      }

      res.send({ todo });
    })
    .catch(error => res.status(400).send());
});

router.patch('/:id', (req, res) => {
  const { id } = req.params;
  const isValidID = ObjectID.isValid(id);
  const body = pick(req.body, ['text', 'completed']);

  if (!isValidID) {
    return res.status(404).send();
  }

  if (isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();

  } else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findByIdAndUpdate(id, { $set: body }, { new: true })
    .then(todo => {
      if (!todo) {
        return res.status(404).send();
      }

      res.send({ todo });
    })
    .catch(error => res.status(400).send());
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const isValidID = ObjectID.isValid(id);

  if (!isValidID) {
    return res.status(404).send();
  }

  Todo.findByIdAndRemove(id)
    .then(todo => {
      if (!todo) {
        return res.status(404).send();
      }

      res.send({ todo });
    })
    .catch(error => res.status(400).send());
});

module.exports = router;
