const BookmarksService = {
  //getAllBookmarks
  getAllBookmarks(knexInstance) {
    return knexInstance
      .select('*')
      .from('bookmarks');
  }, 
  //getById
  getById(knexInstance, id) {
    return knexInstance
      .select('*')
      .from('bookmarks')
      .where('id', id)
      .first();
  }

  //deleteBookmark

  //updateBookmark

  //insertBookmark
};

module.exports = BookmarksService;