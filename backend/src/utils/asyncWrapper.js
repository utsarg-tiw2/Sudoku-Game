// Usage: router.get('/path', asyncWrapper(myControllerFn))
// If myControllerFn throws, the error automatically goes to errorHandler
 

const asyncWrapper = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncWrapper;




