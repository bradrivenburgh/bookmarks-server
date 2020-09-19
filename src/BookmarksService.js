const BookmarksService = {
  getAllBookmarks(knexInstance) {
    return knexInstance
      .select('*')
      .from('bookmarks');
  }, 
  getById(knexInstance, id) {
    return knexInstance
      .select('*')
      .from('bookmarks')
      .where('id', id)
      .first();
  },
  //insertBookmark
  insertArticle(knexInstance, newBookmark) {
    return knexInstance
      .insert(newBookmark)
      .into('bookmarks')
      .returning('*')
      .then(rows => rows[0])
  },

  //deleteBookmark

  //updateBookmark

};

module.exports = BookmarksService;