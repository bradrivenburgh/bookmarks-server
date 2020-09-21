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
  insertArticle(knexInstance, newBookmark) {
    return knexInstance
      .insert(newBookmark)
      .into('bookmarks')
      .returning('*')
      .then(rows => rows[0]);
  },
  deleteBookmark(knexInstance, id) {
    return knexInstance
      .select('*')
      .from('bookmarks')
      .where({ id })
      .delete();
  },
  updateBookmark(knexInstance, id, newBookmarkData) {
    return knexInstance
      .select('*')
      .from('bookmarks')
      .where({ id })
      .update(newBookmarkData);
  }
};

module.exports = BookmarksService;