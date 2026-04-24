// This catches ANY error thrown in a controller and returns a clean JSON response
 
function errorHandler(err, req, res, next) {   // eslint-disable-line no-unused-vars
  console.error(err.stack);
 
  const status  = err.status  || 500;
  const code    = err.code    || 'INTERNAL_ERROR';
  const message = err.message || 'Something went wrong';
 
  res.status(status).json({ error: { code, message } });
}
 
module.exports = errorHandler;
 
