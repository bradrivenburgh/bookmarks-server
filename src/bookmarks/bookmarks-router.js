const express = require('express');
const xss = require('xss');
const { v4: uuid } = require('uuid');
const { logger } = require('../logger');
const { bookmarks } = require('../store');
const { validateProperties } = require('./validationFuncs');
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
          .json(bookmarks)
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
    const newBookmark = {
      title,
      url,
      description,
      rating
    }
 
    // Define the required properties
    const requiredProps = ['title', 'url', 'rating'];

    // Validate properties in the request body
    const errorObject = validateProperties(req.body, requiredProps);

    // If needed, log and respond with missing or invalid props
    if(Object.keys(errorObject).length) {
      const {missingReqProps, invalidProps} = errorObject;
      if (missingReqProps) {
        logger.error(`Required properties are missing: ${missingReqProps.join(', ')}`);
      }
      if (invalidProps) {
        logger.error(`Invalid property values provided: ${invalidProps.join(', ')}`);
      }

      // Send 400 response and object with missing and/or invalid props
      return res
        .status(400)
        .json({error: errorObject})
    }

    // Add the bookmark to the database
    BookmarksService.insertArticle(knexInstance, newBookmark)
      .then(bookmark => {
        // Log bookmark creation 
        logger.info(`Card with the id ${bookmark.id} created`);

        // Send response with location header and created bookmark
        res
          .status(201)
          .location(`/bookmarks/${bookmark.id}`)
          .json(sanitizedBookmark(bookmark))
      })
      .catch(next);
  });

// LOCAL STORAGE BELOW THIS POINT; CONVERT TO DB
// Set up /bookmarks/:id router / endpoint
bookmarksRouter
  .route('/bookmarks/:id')
  .get((req, res, next) => {
    // Get the knexInstance that was set on server.js
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
        // Send requested bookmark in json format
        res
          .status(200)
          .json(bookmark);
      })
      .catch(next);
  });

bookmarksRouter
  .route('/bookmarks/:id')
  .delete((req, res) => {
    // Get the id from the request params
    const { id } = req.params;

    // Get the bookmark index in the bookmarks list; returns -1 if
    // it doesn't exist
    const bookmarkIndex = bookmarks.findIndex(b => b.id === id);

    //Validate wether the bookmark exists
    if (bookmarkIndex === -1) {
      logger.error(`Bookmark with the id ${id} does not exist`)
      return res
        .status(404)
        .json({ error: "Bookmark not found" });
    }

    // Remove the bookmark from the bookmarks list; assume IDs are unique
    bookmarks.splice(bookmarkIndex, 1);

    // Log the deletion of the new bookmark
    logger.info(`Bookmark with the id ${id} deleted.`)
    
    // Send client 204 and end
    res
      .status(204)
      .end();
  });


module.exports = {
  bookmarksRouter: bookmarksRouter
};