const knex = require('knex');
const app = require('../src/app');
const { makeBookmarksArray, makeMaliciousBookmark } = require('./bookmarks.fixtures');

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

  describe('GET /api/bookmarks', () => {
    context('given no bookmarks', () => {
      it('responds with 200 and an empty list', () => {
        return supertest(app)
          .get('/api/bookmarks')
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
        .get('/api/bookmarks')
        .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
        .expect(200, testBookmarks);
      });

      context(`Given an XSS attack bookmark`, () => {
        const { maliciousBookmark, expectedBookmark } = makeMaliciousBookmark();

        beforeEach("insert malicious bookmark", () => {
          return db
            .into("bookmarks")
            .insert([maliciousBookmark]);
        });

        it("removes XSS attack content", () => {
          return supertest(app)
            .get(`/api/bookmarks`)
            .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
            .expect(200)
            .expect((res) => {
              const insertedBookmark = res.body[res.body.length - 1];
              expect(insertedBookmark.title).to.eql(expectedBookmark.title);
              expect(insertedBookmark.description).to.eql(expectedBookmark.description);
            });
        });
      });

    })
  });

  describe('GET /api/bookmarks/:id', () => {
    context('given no bookmarks', () => {
      it('it responds with 404', () => {
        const id = 123456;
        return supertest(app)
          .get(`/api/bookmarks/${id}`)
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
          .get(`/api/bookmarks/${id}`)
          .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
          .expect(200, expectedBookmark);
      });

      context(`Given an XSS attack bookmark`, () => {
        const { maliciousBookmark, expectedBookmark } = makeMaliciousBookmark();

        beforeEach("insert malicious bookmark", () => {
          return db
            .into("bookmarks")
            .insert([maliciousBookmark]);
        });

        it("removes XSS attack content", () => {
          return supertest(app)
            .get(`/api/bookmarks/${maliciousBookmark.id}`)
            .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
            .expect(200)
            .expect((res) => {
              expect(res.body.title).to.eql(expectedBookmark.title);
              expect(res.body.description).to.eql(expectedBookmark.description);
            });
        });
      });

    });
  });

  describe('POST /api/bookmarks', () => {
    it('creates a bookmark, responds with 201 and new article', () => {
      const newBookmark = {
        title: "Some Title",
        url: "http://someurl.com",
        description: "A sample description...",
        rating: 4
      }
      return supertest(app)
        .post('/api/bookmarks')
        .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
        .send(newBookmark)
        .expect(201)
        .expect(res => {
          expect(res.body.title).to.eql(newBookmark.title);
          expect(res.body.description).to.eql(newBookmark.description);
          expect(res.body.url).to.eql(newBookmark.url);
          expect(res.body).to.have.property('id');
          expect(res.headers.location).to.eql(`/api/bookmarks/${res.body.id}`);
        })  
        .then(postRes => {
          return supertest(app)
            .get(`/api/bookmarks/${postRes.body.id}`)
            .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
            .expect(postRes.body)
        });
    });
  

    const requiredFields = ['title', 'url', 'rating'];
    requiredFields.forEach(field => {
      const newBookmark = {
        title: "Some Title",
        url: "http://someurl.com",
        rating: 4
        };
  
      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newBookmark[field];

        return supertest(app)
          .post('/api/bookmarks')
          .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
          .send(newBookmark)
          .expect(400, { error: { missingReqProps: [ `${field}` ] } });
      });
    });

    context(`Given an XSS attack bookmark`, () => {
      const { maliciousBookmark, expectedBookmark } = makeMaliciousBookmark();

      it("removes XSS attack content", () => {
        return supertest(app)
          .post(`/api/bookmarks`)
          .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
          .send(maliciousBookmark)
          .expect(201)
          .expect((res) => {
            expect(res.body.title).to.eql(expectedBookmark.title);
            expect(res.body.description).to.eql(expectedBookmark.description);
          });
      });
    });
  });

  describe('DELETE /api/bookmarks/:id', () => {
    context('given no bookmarks in the database', () => {
      it('responds with 404', () => {
        const bookmarkId = 123456;
        return supertest(app)
          .delete(`/api/bookmarks/${bookmarkId}`)
          .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
          .expect(404, {error: 'Bookmark not found'})
      });
    });

    context('given the are bookmarks in the database', () => {
      const testBookmarks = makeBookmarksArray();

      beforeEach('insert bookmarks', () => {
        return db
          .into('bookmarks')
          .insert(testBookmarks);
      });

      it('responds with 204 and removes the bookmark', () => {
        const idToRemove = 2;
        const expectedBookmarks = testBookmarks
          .filter(bookmark => bookmark.id !== idToRemove);
        return supertest(app)
          .delete(`/api/bookmarks/${idToRemove}`)
          .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
          .expect(204)
          .then(res => {
            return supertest(app)
              .get('/api/bookmarks')
              .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
              .expect(expectedBookmarks)
          });
      });
    });
  });

  describe.skip('PATCH /api/bookmarks/:id', () => {
    context('Given no bookmarks in the db', () => {
      it('responds with 404', () => {
        const bookmarkId = 123456;
        return supertest(app)
          .patch(`/api/bookmarks/${bookmarkId}`)
          .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
          .expect(404, {error: 'Bookmark not found'})
      });
    });

    context('Given there are bookmarks in the db', () => {
      const testBookmarks = makeBookmarksArray();

      beforeEach('insert bookmarks', () => {
        return db 
          .insert(testBookmarks)
          .into('bookmarks')
      });

      it('responds with 204 and updates the article', () => {
        const idToUpdate = 2;
        const updateBookmark = {
          title: 'updated title',
          url: 'http://updatedurl.com',
          description: 'updated description',
          rating: 4
        };
        const expectedBookmark = {
          ...testBookmarks[idToUpdate - 1],
          ...updateBookmark
        };

        return supertest(app)
          .patch(`/api/bookmarks/${idToUpdate}`)
          .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
          .expect(204)
          .then(res => {
            return supertest(app)
              .get(`/api/bookmarks/${idToUpdate}`)
              .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
              .expect(expectedBookmark)
          });
      });

      
    });

  });
});
