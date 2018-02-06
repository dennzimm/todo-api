const express = require('express');
const { ObjectID } = require('mongodb');
const { pick, isBoolean } = require('lodash');

const { Todo } = require('./../models/todo');
const { authenticate } = require('./../middlewares/authenticate');

const router = express.Router();

router.post('/', authenticate, (req, res) => {
  const body = pick(req.body, ['text']);
  const user = pick(req.user, ['_id']);

  const todo = new Todo({
    _creator: user._id,
    text: body.text
  });

  todo
    .save()
    .then(todo => res.send(todo))
    .catch(error => res.status(400).send(error));
});

router.get('/', authenticate, (req, res) => {
  Todo
    .find({
      _creator: req.user._id
    })
    .then(todos => {
      res.send({ todos });
    })
    .catch(error => {
      res.status(400).send(error);
    });
});

router.get('/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const isValidID = ObjectID.isValid(id);

  if (!isValidID) {
    return res.status(404).send();
  }

  Todo
    .findOne({
      _id: id,
      _creator: req.user._id
    })
    .then(todo => {
      if (!todo) {
        return res.sendStatus(404);
      }

      res.send({ todo });
    })
    .catch(error => res.status(400).send());
});

router.patch('/:id', authenticate, (req, res) => {
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

  Todo.findOneAndUpdate({
    _id: id,
    _creator: req.user._id
  }, { $set: body }, { new: true })
    .then(todo => {
      if (!todo) {
        return res.status(404).send();
      }

      res.send({ todo });
    })
    .catch(error => res.status(400).send());
});

router.delete('/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const isValidID = ObjectID.isValid(id);

  if (!isValidID) {
    return res.status(404).send();
  }

  Todo
    .findOneAndRemove({
      _id: id,
      _creator: req.user._id
    })
    .then(todo => {
      if (!todo) {
        return res.status(404).send();
      }

      res.send({ todo });
    })
    .catch(error => res.status(400).send());
});

module.exports = router;
