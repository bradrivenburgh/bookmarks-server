const app = require('../src/app');

describe('GET /', () => {
  it('should respond with 200, "Hello, bookmarks-app!"', () => {
    return supertest(app)
      .get('/')
      .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
      .expect(200, 'Hello, bookmarks-app!');
  });
  it('should respond with 401, { error: "Unauthorized request" }', () => {
    return supertest(app)
      .get('/')
      .expect(401, JSON.stringify({ error: 'Unauthorized request' }));
  });
});

describe('GET /bookmarks', () => {
  it('should respond with 200 and return an array with at least one item', () => {
    return supertest(app)
      .get('/bookmarks')
      .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
      .expect(200)
      .then(res => {
        expect(res.body).to.be.an('array');
        expect(res.body).to.have.a.lengthOf.at.least(1);
      });
  });
});

describe('POST /bookmarks', () => {
  it('should respond with 400 and "Invalid data" if required data is missing"', () => {
    return supertest(app)
      .post('/bookmarks')
      .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
      .expect(400, JSON.stringify({ error: 'Invalid data' }));
  });
  it('should respond with 201, return bookmark created bookmarks object', () => {
    return supertest(app)
      .post('/bookmarks')
      .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
      .send({"title": "Google", "url":"www.google.com", "description": "A site that does a pretty good job of search all of human knowledge to give you an answer", "rating": 5})
      .expect(201)
      .then(res => {
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.all.keys("id", "title", "url", "description", "rating");
      });
  });
  it('should return a bookmark with a rating prop value of type number', () => {
    return supertest(app)
      .post('/bookmarks')
      .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
      .send({"title": "Google", "url":"www.google.com", "description": "A site that does a pretty good job of search all of human knowledge to give you an answer", "rating": 5})
      .expect(201)
      .then(res => {
        expect(res.body.rating).to.be.a('number');
      });
  });
});

describe('GET /bookmarks/:id', () => { 
  it('should return 404 and appropriate error message', () => {
    return supertest(app)
    .get('/bookmarks/1')
    .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
    .expect(404, JSON.stringify({ error: 'Bookmark not found'}));
  });
  it('should respond with 200, return specified bookmark object', () => {
    return supertest(app)
      .get('/bookmarks/c87a6062-f117-11ea-adc1-0242ac120002')
      .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
      .expect(200)
      .then(res => {
        expect(res.body).to.be.an('object');
        expect(res.body.id).to.equal('c87a6062-f117-11ea-adc1-0242ac120002');
      });
  });
});

describe('DELETE /bookmarks/:id', () => {
  it('should return 404 and appropriate error message', () => {
    return supertest(app)
      .delete('/bookmarks/1')
      .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
      .expect(404, JSON.stringify({ error: 'Bookmark not found'}))
  });
  it('should respond with 204 and end', () => {
    return supertest(app)
      .delete('/bookmarks/c87a6062-f117-11ea-adc1-0242ac120002')
      .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
      .expect(204)
  });
});
