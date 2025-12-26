// src/middlewares/csrf.js
const csrf = require('csurf');

// CSRF protection using cookies
// This will attach a CSRF token to each request and validate POST/PUT/DELETE requests
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'strict',
  },
});

// Middleware to attach CSRF token to response locals or JSON
const attachCsrfToken = (req, res, next) => {
  if (req.csrfToken) {
    // for JSON APIs, send token in header or response body
    res.locals.csrfToken = req.csrfToken();
    res.setHeader('X-CSRF-Token', res.locals.csrfToken);
  }
  next();
};

module.exports = { csrfProtection, attachCsrfToken };
