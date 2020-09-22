const path = require('path');
const express = require('express');
const xss = require('xss');

const { logger } = require('../logger');
const { ValidationService } = require('./ValidationService');
const BookmarksService = require('../BookmarksService');

const bookmarksRouter = express.Router();
const sanitizedBookmark = (bookmark) => ({
  id: bookmark.id,
  title: xss(bookmark.title),
  url: xss(bookmark.url),
  description: xss(bookmark.description),
  rating: bookmark.rating
})

bookmarksRouter
  .route('/bookmarks')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    BookmarksService.getAllBookmarks(knexInstance)
      .then(bookmarks => {
        res
          .status(200)
          .json(bookmarks.map(sanitizedBookmark))
      })
      .catch(next)
  });

bookmarksRouter
  .route('/bookmarks')
  .post((req, res, next) => {
    // Create knex instance
    const knexInstance = req.app.get('db');
    
    // Get props from request body
    const { title, url, description, rating } = req.body;

    // Create new bookmark object
    const newBookmark = { title, url, description, rating };
 
    // Define the required properties for validation
    const requiredProps = ['title', 'url', 'rating'];

    // Define invalid values for caller's required properties;
    // pass this to ValidationService
    const requiredPropValFuncs = {
      title: (value) => {
        if (!value) { 
          return false;
        }
      },
      url: (value) => {
        if (!value) {
          return false;
        }
      },
      rating: (value) => {
        if (typeof value !== 'number' || value < 0 || value > 5) {
          return false;
        }
      },
    };

    // Check request body for missing or invalid required props
    const missingAndInvalidProps = ValidationService.validateProperties(
      req.body, 
      requiredProps, 
      requiredPropValFuncs
    );
    
    // If there are missing or invalid required props log the error
    // and send a 400 response with JSON error object
    if (
      missingAndInvalidProps.invalidProps.length ||
      missingAndInvalidProps.missingProps.length
    ) {
 
      const customInvalidPropsMessages = {
        rating: 'Invalid property provided: rating -- must be a number between 0 and 5',
      };
 
      const validationErrorObj = ValidationService.createValidationErrorObject(
        missingAndInvalidProps,
        customInvalidPropsMessages
      );
 
      logger.error(validationErrorObj.error.message);
 
      return res.status(400).json(validationErrorObj);
    }

    // If validation passes, add the bookmark to the database
    BookmarksService.insertArticle(knexInstance, newBookmark)
      .then(bookmark => {
        // Log bookmark creation 
        logger.info(`Card with the id ${bookmark.id} created`);

        // Send response with location header and new (sanitized) bookmark
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${bookmark.id}`))
          .json(sanitizedBookmark(bookmark))
      })
      .catch(next);
  });

// Set up /bookmarks/:id router / endpoint
bookmarksRouter
  .route('/bookmarks/:id')
  .all((req, res, next) => {
    const knexInstance = req.app.get('db');
    const id = req.params.id;
    BookmarksService.getById(knexInstance, id)
      .then(bookmark => {
        // Validate the bookmark existence.  If not, return and log 404 error / message
        if (!bookmark) {
          logger.error(`Bookmark with id ${id} does not exist`)
          return res
            .status(404)
            .json({ error: 'Bookmark not found'});
        }
        res.bookmark = bookmark;
        next();
      })
      .catch(next);
  });

bookmarksRouter
  .route('/bookmarks/:id')
  .get((req, res, next) => {
    res.json(sanitizedBookmark(res.bookmark));
  });

bookmarksRouter
  .route('/bookmarks/:id')
  .delete((req, res, next) => {
    const knexInstance = req.app.get('db');
    const id = req.params.id;
    BookmarksService.deleteBookmark(knexInstance, id)
      .then(numRowsDeleted => {
        res
        .status(204)
        .end()
      })
      .catch(next)
  });

//bookmarksRouter

module.exports = {
  bookmarksRouter: bookmarksRouter
};