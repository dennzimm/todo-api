const express = require('express');
const { pick } = require('lodash');

const { User } = require('./../models/user');
const { authenticate } = require('./../middlewares/authenticate');

const router = express.Router();

router.post('/', (req, res) => {
  const body = pick(req.body, ['email', 'password']);
  const user = new User(body);

  user
    .save()
    .then(() => {
      return user.generateAuthToken();
    })
    .then(token => {
      res.header('x-auth', token).send(user);
    })
    .catch(error => res.status(400).send(error));
});

router.post('/login', (req, res) => {
  const body = pick(req.body, ['email', 'password']);

  User.findByCredentials(body.email, body.password)
    .then(user => {
      return user.generateAuthToken()
        .then(token => {
          res.header('x-auth', token).send(user);
        });
    })
    .catch(error => {
      res.status(400).send();
    });
});

router.get('/me', authenticate, (req, res) => res.send(req.user));

router.delete('/me/token', authenticate, (req, res) => {
  req.user.removeToken(req.token)
    .then(() => {
      res.status(200).send();
    })
    .catch(error => {
      res.status(400).send();
    });
});

module.exports = router;
