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

  describe('POST /users/login', () => {
    it('should login user and return auth token', done => {
      request(app)
        .post('/users/login')
        .send({
          email: users[1].email,
          password: users[1].password
        })
        .expect(200)
        .expect(res => {
          expect(res.headers['x-auth']).toBeTruthy();
        })
        .end((err, res) => {
          if (err) {
            done(err);
          }

          User.findById(users[1]._id)
            .then(user => {
              expect(user.tokens[0].access).toBe('auth');
              expect(user.tokens[0].token).toBe(res.headers['x-auth']);
              done();
            })
            .catch(error => {
              done(error);
            });
        });
    });

    it('should reject invalid login', done => {
      request(app)
        .post('/users/login')
        .send({
          email: users[1].email,
          password: 'wrongPass'
        })
        .expect(400)
        .expect(res => {
          expect(res.headers['x-auth']).toBeFalsy();
        })
        .end((err, res) => {
          if (err) {
            done(err);
          }

          User.findById(users[1]._id)
            .then(user => {
              expect(user.tokens.length).toBe(0);
              done();
            })
            .catch(error => {
              done(error);
            })
        });
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

  describe('DELETE /users/me/token', () => {
    it('should logout user and remove auth token', done => {
      request(app)
        .delete('/users/me/token')
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect(res => {
          expect(res.headers['x-auth']).toBeUndefined();
        })
        .end((err, res) => {
          if (err) {
            done(err);
          }

          User.findById(users[0]._id)
            .then(user => {
              expect(user.tokens.length).toBe(0);
              done();
            })
            .catch(error => {
              done(error);
            });
        });
    });
  });

  describe('DELETE /users/me/token', () => {
    it('should return 401 if unauthorized try to logout', done => {
      request(app)
        .delete('/users/me/token')
        .expect(401)
        .end(done);
    });
  });
});
