const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/index');

const Users = require('../users/users-model');

module.exports = (req, res, next) => {
  /*
    IMPLEMENT

    1- On valid token in the Authorization header, call next.

    2- On missing token in the Authorization header,
      the response body should include a string exactly as follows: "token required".

    3- On invalid or expired token in the Authorization header,
      the response body should include a string exactly as follows: "token invalid".
  */
  const token = req.headers.authorization;

  if(token) {
    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
      // if (err != null) {
      //   res.status(401).json({ message: 'token invalid' });
      //   return;
      // }

      const user = await Users.findById(decoded.id);
      if(user == null) {
        res.status(401).json({ message: 'token invalid' });
        return;
      }
      
      req.decodedJwt = decoded;
      next();
    })
  } else {
    res.status(401).json({ message: 'token required' })
  }
};
