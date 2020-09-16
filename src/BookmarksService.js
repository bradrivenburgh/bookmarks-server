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
  }

  //deleteBookmark

  //updateBookmark

  //insertBookmark
};

module.exports = BookmarksService;