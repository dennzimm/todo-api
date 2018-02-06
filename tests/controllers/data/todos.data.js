const { ObjectID } = require('mongodb');

const { Todo } = require('./../../../models/todo');
const { users } = require('./users.data');

const todos = [
  {
    _id: new ObjectID(),
    _creator: users[0]._id,
    text: 'First test todo'
  },
  {
    _id: new ObjectID(),
    _creator: users[1]._id,
    text: 'Second test todo',
    completed: true,
    completedAt: 333
  }
];

const populateTodos = done => {
  Todo.remove({})
    .then(() => {
      return Todo.insertMany(todos);
    })
    .then(() => done());
};

module.exports = { todos, populateTodos };
