// src/loaders/passport.js
const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const { JWT_SECRET } = require('../config/env');
const User = require('../modules/user/user.model'); // Mongoose User model
const logger = require('../config/logger');

const initPassport = () => {
  // JWT Strategy
  const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: JWT_SECRET,
  };

  passport.use(
    new JwtStrategy(opts, async (jwtPayload, done) => {
      try {
        const user = await User.findById(jwtPayload.id).select('-password');
        if (user) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      } catch (err) {
        logger.error('Passport JWT error ❌', err);
        return done(err, false);
      }
    })
  );

  return passport;
};

module.exports = initPassport;
