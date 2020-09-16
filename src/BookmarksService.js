const BookmarksService = {
  //getAllBookmarks
  getAllBookmarks(knexInstance) {
    return knexInstance
      .select('*')
      .from('bookmarks');
  }, 
  //getById

  //deleteBookmark

  //updateBookmark

  //insertBookmark
};

module.exports = BookmarksService;