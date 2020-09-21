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

    // Validate properties in the request body
    const errorObject = ValidationService
      .validateProperties(req.body, requiredProps);

    // If needed, log and respond with validation errors
    if(Object.keys(errorObject).length) {
      return ValidationService
        .reportValidationErrors(errorObject, res);
    }

    // If validation passes, add the bookmark to the database
    BookmarksService.insertArticle(knexInstance, newBookmark)
      .then(bookmark => {
        // Log bookmark creation 
        logger.info(`Card with the id ${bookmark.id} created`);

        // Send response with location header and new (sanitized) bookmark
        res
          .status(201)
          .location(`/bookmarks/${bookmark.id}`)
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

module.exports = {
  bookmarksRouter: bookmarksRouter
};