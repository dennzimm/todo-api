const express = require('express');
const { pick } = require('lodash');

const { User } = require('./../models/user');

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
      res
        .header('x-auth', token)
        .send(user);
    })
    .catch(error => res.status(400).send(error));
});

module.exports = router;
