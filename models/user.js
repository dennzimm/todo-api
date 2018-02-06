const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { pick } = require('lodash');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email'
    }
  },
  password: {
    type: String,
    require: true,
    minlength: 6
  },
  tokens: [
    {
      access: {
        type: String,
        required: true
      },
      token: {
        type: String,
        required: true
      }
    }
  ]
});

UserSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  return pick(userObject, ['_id', 'email']);
};

UserSchema.methods.generateAuthToken = function () {
  const user = this;
  const access = 'auth';
  const token = jwt.sign({
    _id: user._id.toHexString(),
    access
  }, 'abc123').toString();

  user.tokens.push({ access, token });

  return user.save()
    .then(() => {
      return token;
    });
};

UserSchema.statics.findByToken = function (token) {
  const User = this;
  let decoded;

  try {
    decoded = jwt.verify(token, 'abc123');

  } catch (error) {
    return Promise.reject();
  }

  return User.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  });
};

UserSchema.statics.findByCredentials = function (email, password) {
  const User = this;

  return User.findOne({ email })
    .then(user => {
      if (!user) {
        return Promise.reject();
      }

      return new Promise((resolve, reject) => {
        bcrypt.compare(password, user.password, (err, success) => {
          if (success) {
            resolve(user);
          } else {
            reject();
          }
        });
      });
    });
};

UserSchema.pre('save', function (next) {
  const user = this;
  const { password } = user;

  if (user.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(password, salt, (err, hash) => {
        user.password = hash;
        next();
      });
    });

  } else {
    next();
  }
});

const User = mongoose.model('User', UserSchema);

module.exports = { User };
