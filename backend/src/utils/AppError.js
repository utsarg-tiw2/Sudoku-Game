class AppError extends Error {
  constructor(message, status = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.status = status;
    this.code   = code;
  }
}
 
module.exports = AppError;
 
// Example usage in a controller:
// throw new AppError('User not found', 404, 'NOT_FOUND');
 
