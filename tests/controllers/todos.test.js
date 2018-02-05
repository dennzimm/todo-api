const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('./../../app');
const { Todo } = require('./../../models/todo');

const todos = [
  {
    _id: new ObjectID(),
    text: 'First test todo',
  },
  {
    _id: new ObjectID(),
    text: 'Second test todo',
    completed: true,
    completedAt: 333,
  }
];

beforeEach(done => {
  Todo.remove({})
    .then(() => {
      return Todo.insertMany(todos);
    })
    .then(() => done());
});

describe('TODOS', () => {
  describe('POST /todos', () => {
    it('should create a new todo', done => {
      const text = 'Take a break for lunch.';

      request(app)
        .post('/todos')
        .send({ text })
        .expect(200)
        .expect(res => {
          expect(res.body.text).toBe(text);
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          Todo.find({ text })
            .then(todos => {
              expect(todos.length).toBe(1);
              expect(todos[0].text).toBe(text);
              done();
            })
            .catch(error => {
              done(error);
            });
        });
    });

    it('should not create a todo with invalid body data', done => {
      request(app)
        .post('/todos')
        .send({})
        .expect(400)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          Todo.find()
            .then(todos => {
              expect(todos.length).toBe(2);
              done();
            })
            .catch(error => done(error));
        });
    });
  });

  describe('GET /todos', () => {
    it('should get all todos', done => {
      request(app)
        .get('/todos')
        .expect(200)
        .expect(res => {
          expect(res.body.todos.length).toBe(2);
        })
        .end(done);
    });
  });

  describe('GET /todos/:id', () => {
    it('should get individual todo', done => {
      request(app)
        .get(`/todos/${todos[0]._id.toHexString()}`)
        .expect(200)
        .expect(res => {
          expect(res.body.todo.text).toBe(todos[0].text);
        })
        .end(done);
    });

    it('should return 404 if todo not found', done => {
      const newID = new ObjectID().toHexString();

      request(app)
        .get(`/todos/${newID}`)
        .expect(404)
        .end(done);
    });

    it('should return 404 for non-OnjectIDs', done => {
      const invalidID = '123abc';

      request(app)
        .get(`/todos/${invalidID}`)
        .expect(404)
        .end(done);
    });
  });

  describe('PATCH /todos/:id', () => {
    it('should update the todo', done => {
      const id = todos[0]._id.toHexString();
      const body = {
        text: 'New Text',
        completed: true
      };

      request(app)
        .patch(`/todos/${id}`)
        .send(body)
        .expect(200)
        .expect(res => {
          expect(res.body.todo.text).toBe(body.text);
          expect(res.body.todo.completed).toBeTruthy();
          expect(res.body.todo.completedAt).toBeTruthy();
        })
        .end(done);
    });

    it('should clear completedAt when todo is not completed', done => {
      const id = todos[1]._id.toHexString();
      const body = {
        text: 'Another new text',
        completed: false
      };

      request(app)
        .patch(`/todos/${id}`)
        .send(body)
        .expect(200)
        .expect(res => {
          expect(res.body.todo.text).toBe(body.text);
          expect(res.body.todo.completed).toBeFalsy();
          expect(res.body.todo.completedAt).toBeFalsy();
        })
        .end(done);
    });
  });

  describe('DELETE /todos/:id', () => {
    it('should remove a todo', done => {
      const hexID = todos[1]._id.toHexString();

      request(app)
        .delete(`/todos/${hexID}`)
        .expect(200)
        .expect(res => {
          expect(res.body.todo._id).toBe(hexID);
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          Todo.findById(hexID)
            .then(todo => {
              expect(todo).toBeFalsy();
              done();
            })
            .catch(error => done(error));
        });
    });

    it('should return 404 if todo not found', done => {
      const newID = new ObjectID().toHexString();

      request(app)
        .delete(`/todos/${newID}`)
        .expect(404)
        .end(done);
    });

    it('should return 404 if object id is invalid', done => {
      const invalidID = '123abc';

      request(app)
        .delete(`/todos/${invalidID}`)
        .expect(404)
        .end(done);
    });
  });
});
