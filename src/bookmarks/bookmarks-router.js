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
  .post(bodyParser, (req, res) => {
    // Get the data from the request body; default values for optional props
    const { title, url, description='', rating=0 } = req.body;
    console.log(title)
    // Validate the data: title and url required
    if (!title) {
      logger.error('Title is required');
      return res
        .status(400)
        .json({ error: 'Invalid data' });
    }

    if (!url) {
      logger.error('URL is required');
      return res
        .status(400)
        .json({ error: 'Invalid data' });
    }

    // Generate a unique id
    const id = uuid();

    // Create the bookmark data
    const bookmark = {
      id,
      title,
      url,
      description,
      rating
    }

    // Add the bookmark to the bookmarks list
    bookmarks.push(bookmark);

    // Log bookmark creation 
    logger.info(`Card with the id ${id} created`);
    
    // Send response with location header and created bookmark
    res
      .status(201)
      .location(`http://localhost:8000/bookmarks/${id}`)
      .json(bookmark);
  });

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

    // Send requested bookmark in json format
    res.json(bookmark);
  })


module.exports = {
  bookmarksRouter: bookmarksRouter
};