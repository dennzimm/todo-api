const expect = require('expect');
const request = require('supertest');

const { app } = require('./../../app');
const { User } = require('./../../models/user');
const { users, populateUsers } = require('./data/users.data');

beforeEach(populateUsers);

describe('USERS', () => {
  describe('POST /users', () => {
    it('should create a user', done => {
      const newUser = {
        email: 'newuser@mail.com',
        password: 'secret'
      };
      const { email } = newUser;

      request(app)
        .post('/users')
        .send(newUser)
        .expect(200)
        .expect(res => {
          expect(res.headers['x-auth']).toBeTruthy();
          expect(res.body._id).toBeTruthy();
          expect(res.body.email).toBe(newUser.email);
        })
        .end(err => {
          if (err) {
            done(err);
          }

          User.findOne({ email })
            .then(user => {
              expect(user).toBeTruthy();
              expect(user.password).not.toBe(newUser.password);
              done();
            })
            .catch(error => {
              done(error);
            });
        });
    });

    it('should return validation errors if request is invalid', done => {
      const invalidUser = {
        email: 'what',
        password: '1'
      };

      request(app)
        .post('/users')
        .send(invalidUser)
        .expect(400)
        .end(done);
    });

    it('should not create a user if email is in use', done => {
      const user = {
        email: users[0].email,
        password: 'secret'
      };

      request(app)
        .post('/users')
        .send(user)
        .expect(400)
        .end(done);
    });
  });

  describe('GET /users/me', () => {
    it('should return user if authenticated', done => {
      request(app)
        .get('/users/me')
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect(res => {
          expect(res.body._id).toBe(users[0]._id.toHexString());
          expect(res.body.email).toBe(users[0].email);
        })
        .end(done);
    });

    it('should return 401 if not authenticated', done => {
      request(app)
        .get('/users/me')
        .expect(401)
        .expect(res => {
          expect(res.body).toEqual({});
        })
        .end(done);
    });
  });
});