const ERRORS = require('../../src/core/constants').ERRORS;
// auth routes – verify token
const insideRouteSecretAttached = async (req, res, next) => {
  try {
 
    req.attachedSECRET={}; 
    next();
  } catch (err) {
    return res.status(401).json({ error: ERRORS.COULD_NOT_ATTACH_SECRET });
  }
};

// Role-based access
 
module.exports = { insideRouteSecretAttached };
