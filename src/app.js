require('dotenv').config();
const express = require('express');
const { logger } = require('./logger');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const { bookmarksRouter } = require('./bookmarks/bookmarks-router');

const app = express();

// Create morgan, validation, and error-handling middleware logic

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

const corsOptions = {
  origin: 'https://bookmarks-app-wheat.vercel.app',
  optionsSuccessStatus: 200
}

// Define validation function
function validateBearerToken(req, res, next) {
  const apiToken = process.env.API_TOKEN;
  const authToken = req.get('Authorization');

  if (!authToken || authToken.split(' ')[1] !== apiToken) {
    logger.error(`Unauthorized request to path: ${req.path}`);
    return res.status(401).json({ error: 'Unauthorized request' });
  }
  // move to the next middleware
  next();
}

// Define error handler
function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } }
  } else {
    console.error(error)
    response = { message: error.message, error }
  }
  res.status(500).json(response);
}

// Add middleware
app.use(morgan(morganOption));
app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json());
app.use(validateBearerToken);
app.use('/api', bookmarksRouter);
app.use(errorHandler);

// Add endpoints
app.get('/', (req, res) => {
  res.send('Hello, bookmarks-app!');
});

module.exports = app;