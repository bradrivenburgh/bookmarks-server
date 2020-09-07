const express = require('express');
const { v4: uuid } = require('uuid');
const { logger } = require('../logger');
const { bookmarks } = require('../store');


const bookmarksRouter = express.Router();
const bodyParser = express.json();

// Set up /bookmarks router / endpoint
bookmarksRouter
  .route('/bookmarks')
  .get((req, res) => {
    res.json(bookmarks);
  })

// Set up /bookmarks/:id router / endpoint
bookmarksRouter
  .route('/bookmarks/:id')
  .get((req, res) => {
    // Get the id param
    const { id } = req.params;
    // Find the first bookmark with correct id from the bookmarks list
    const bookmark = bookmarks.find(b => b.id === id);

    // Validate the bookmark existence.  If not, return and log 404 error / message
    if (!bookmark) {
      logger.error(`Bookmark with id ${id} does not exist`)
      return res
        .status(404)
        .json({ error: 'Bookmark not found'});
    }

    // Return the bookmark in json format
    res.json(bookmark);
  })


module.exports = {
  bookmarksRouter: bookmarksRouter
};