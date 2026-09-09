/**
 * Centralized API Error Handling Middleware
 * Ensures all errors return clean, predictable JSON responses.
 */
export const errorHandler = (err, req, res, next) => {
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({ error: messages[0] || 'Validation error' });
  }

  // Duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(400).json({ error: `Duplicate value for ${field}` });
  }

  // CastError (invalid ObjectId or type casting)
  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid identifier format' });
  }

  console.error('Unhandled Server Error:', err);

  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  return res.status(statusCode).json({
    error: err.message || 'Internal server error',
  });
};
