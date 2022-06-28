const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = require('express').Router();
const Jokes = require('../jokes/jokes-data');
const Users = require('../users/users-model');

const { JWT_SECRET } = require('../config/index')

router.post('/register', (req, res, next) => {
  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.
    DO NOT EXCEED 2^8 ROUNDS OF HASHING!

    1- In order to register a new account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel", // must not exist already in the `users` table
        "password": "foobar"          // needs to be hashed before it's saved
      }

    2- On SUCCESSFUL registration,
      the response body should have `id`, `username` and `password`:
      {
        "id": 1,
        "username": "Captain Marvel",
        "password": "2a$08$jG.wIGR2S4hxuyWNcBf9MuoC4y0dNy7qC/LbmtuFBSdIhWks2LhpG"
      }

    3- On FAILED registration due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED registration due to the `username` being taken,
      the response body should include a string exactly as follows: "username taken".
  */

  let user = req.body;

  const hash = bcrypt.hashSync(user.password, 8);

  user.password = hash;

  if(!user.username || !user.password) {
    res.status(401).json({ message: 'username and password required' })
  } else {    
    Users.add(user)
      .then(saved => {
          res.status(201).json(saved)
      })
      .catch(next)
  }
});

router.post('/login', (req, res, next) => {
  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.

    1- In order to log into an existing account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel",
        "password": "foobar"
      }

    2- On SUCCESSFUL login,
      the response body should have `message` and `token`:
      {
        "message": "welcome, Captain Marvel",
        "token": "eyJhbGciOiJIUzI ... ETC ... vUPjZYDSa46Nwz8"
      }

    3- On FAILED login due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED login due to `username` not existing in the db, or `password` being incorrect,
      the response body should include a string exactly as follows: "invalid credentials".
  */
  let { username, password } = req.body

  if(!username || !password) {
    res.status(401).json({ message: 'username and password required' })
  } else {
    Users.findBy({ username })
        .then(([user]) => {
          if(user && bcrypt.compareSync(password, user.password)) {
            const token = generateToken(user)
            res.status(200).json({ token, message: `Welcome back ${user.username}!` })
          } else {
            next({ status: 400, message: 'invalid credentials' })
          }
        })
        .catch(next)
  }
});

function generateToken(user) {
  const payload = {
    id: user.id,
    username: user.username
  };
  const options = {
    expiresIn: '5m',
  };
  return jwt.sign(payload, JWT_SECRET, options);
}

module.exports = router;
