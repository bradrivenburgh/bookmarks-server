const knex = require('knex');
const app = require('../src/app');
const { makeBookmarksArray } = require('./bookmarks.fixtures');

describe.only('Bookmarks Endpoints', () => {
  let db;

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    });

    app.set('db', db);
  });
  before('clean the table before all tests run', () => db('bookmarks').truncate());
  after('disconnect from the db after all tests run', () => db.destroy());
  afterEach('cleanup the table after each test runs', () => db('bookmarks').truncate())

  describe('GET /bookmarks', () => {
    context('given no bookmarks', () => {
      it('responds with 200 and an empty list', () => {
        return supertest(app)
          .get('/bookmarks')
          .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
          .expect(200, [])
      });
    });

    context('given there are bookmarks in the database', () => {
      const testBookmarks = makeBookmarksArray();

      beforeEach('insert bookmarks into the table', () => {
        return db
          .into('bookmarks')
          .insert(testBookmarks);      
      });

      it('responds with 200 and all bookmarks', () => {
        return supertest(app)
        .get('/bookmarks')
        .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
        .expect(200, testBookmarks);
      });
    })
  });

  describe('GET /bookmarks/:id', () => {
    context('given no bookmarks', () => {
      it('it responds with 404', () => {
        const id = 123456;
        return supertest(app)
          .get(`/bookmarks/${id}`)
          .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
          .expect(404, { error: 'Bookmark not found' });
      });
    });

    context('given there are bookmarks in the database', () => {
      const testBookmarks = makeBookmarksArray();

      beforeEach('insert bookmarks into the table', () => {
        return db
          .into('bookmarks')
          .insert(testBookmarks);      
      });

      it('responds with 200 and the specified bookmark', () => {
        const id = 1;
        const expectedBookmark = testBookmarks[id - 1];
        return supertest(app)
          .get(`/bookmarks/${id}`)
          .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
          .expect(200, expectedBookmark);
      });
    });
  })

});
