'use strict';

const path = require('path');
const lowdb = require('lowdb');
const FileAsync = require('lowdb/adapters/FileAsync');
const request = require('supertest');
const shortid = require('shortid');

const createApp = require('../src/index');

let app;

beforeAll(async () => {
  // Create a test database
  const testDbPath = path.join(__dirname, 'test.db.json');
  const db = await lowdb(new FileAsync(testDbPath));

  // Fill the test database with data
  await db.setState({
    butterflies: [
      {
        id: 'wxyz9876',
        commonName: 'test-butterfly',
        species: 'Testium butterflius',
        article: 'https://example.com/testium_butterflius'
      },
      {
        id: 'xRKSdjkBt4',
        commonName: 'Plum Judy',
        species: 'Abisara echerius',
        article: 'https://en.wikipedia.org/wiki/Abisara_echerius'
      },
      {
        'id': 'DCenP4kQNQ',
        'commonName': 'Mexican Bluewing',
        'species': 'Myscelia ethusa',
        'article': 'https://en.wikipedia.org/wiki/Myscelia_ethusa'
      }
    ],
    users: [
      {
        id: 'abcd1234',
        username: 'test-user'
      },
      {
        id: 'cdef1234',
        username: 'test-user2'
      },
      {
        id: 'abcd12345',
        username: 'test-user3'
      },
      {
        id: 'abcd12346',
        username: 'test-user4'
      }
    ],
    ratings: [
      {
        userId: 'abcd1234',
        butterflyId: 'wxyz9876',
        rating: 5
      },
      {
        userId: 'cdef1234',
        butterflyId: 'xRKSdjkBt4',
        rating: 4

      },
      {
        userId: 'abcd1234',
        butterflyId: 'xRKSdjkBt4',
        rating: 4
      },
      {
        userId: 'cdef1234',
        butterflyId: 'wxyz9876',
        rating: 3

      }
    ]
  }).write();

  // Create an app instance
  app = await createApp(testDbPath);
});

describe('GET root', () => {
  it('success', async () => {
    const response = await request(app)
      .get('/');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: 'Server is running!'
    });
  });
});

describe('GET butterfly', () => {
  it('success', async () => {
    const response = await request(app)
      .get('/butterflies/wxyz9876');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: 'wxyz9876',
      commonName: 'test-butterfly',
      species: 'Testium butterflius',
      article: 'https://example.com/testium_butterflius'
    });
  });

  it('error - not found', async () => {
    const response = await request(app)
      .get('/butterflies/bad-id');
    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: 'Not found'
    });
  });
});

describe('POST butterfly', () => {
  it('success', async () => {
    shortid.generate = jest.fn().mockReturnValue('new-butterfly-id');

    const postResponse = await request(app)
      .post('/butterflies')
      .send({
        commonName: 'Boop',
        species: 'Boopi beepi',
        article: 'https://example.com/boopi_beepi'
      });

    expect(postResponse.status).toBe(200);
    expect(postResponse.body).toEqual({
      id: 'new-butterfly-id',
      commonName: 'Boop',
      species: 'Boopi beepi',
      article: 'https://example.com/boopi_beepi'
    });

    const getResponse = await request(app)
      .get('/butterflies/new-butterfly-id');
    expect(getResponse.status).toBe(200);
    expect(getResponse.body).toEqual({
      id: 'new-butterfly-id',
      commonName: 'Boop',
      species: 'Boopi beepi',
      article: 'https://example.com/boopi_beepi'
    });
  });

  it('error - empty body', async () => {
    const response = await request(app)
      .post('/butterflies')
      .send();

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Invalid request body'
    });
  });

  it('error - missing all attributes', async () => {
    const response = await request(app)
      .post('/butterflies')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Invalid request body'
    });
  });

  it('error - missing some attributes', async () => {
    const response = await request(app)
      .post('/butterflies')
      .send({ commonName: 'boop' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Invalid request body'
    });
  });
});

describe('GET user', () => {
  it('success', async () => {
    const response = await request(app)
      .get('/users/abcd1234');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: 'abcd1234',
      username: 'test-user'
    });
  });

  it('error - not found', async () => {
    const response = await request(app)
      .get('/users/bad-id');
    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: 'Not found'
    });
  });
});

describe('POST user', () => {
  it('success', async () => {
    shortid.generate = jest.fn().mockReturnValue('new-user-id');

    const postResponse = await request(app)
      .post('/users')
      .send({
        username: 'Buster'
      });

    expect(postResponse.status).toBe(200);
    expect(postResponse.body).toEqual({
      id: 'new-user-id',
      username: 'Buster'
    });

    const getResponse = await request(app)
      .get('/users/new-user-id');
    expect(getResponse.status).toBe(200);
    expect(getResponse.body).toEqual({
      id: 'new-user-id',
      username: 'Buster'
    });
  });

  it('error - empty body', async () => {
    const response = await request(app)
      .post('/users')
      .send();

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Invalid request body'
    });
  });

  it('error - missing all attributes', async () => {
    const response = await request(app)
      .post('/users')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Invalid request body'
    });
  });
});


describe('POST rating', () => {
  it('error - empty body expecting invalid request body', async () => {
    const response = await request(app)
      .put('/ratings')
      .send();
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'invalid request body'
    });
  });

  it('valid input details expecting successfully updated of rating', async () => {
    const response = await request(app)
      .put('/ratings')
      .send({
        userId: 'abcd1234',
        butterflyId: 'wxyz9876',
        rating: 5
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      {
        message: 'successfully updated'
      }
    );
  });

  it('rating is greater 5 in the input body expecting invalid request body response (input validation) ', async () => {
    const response = await request(app)
      .put('/ratings')
      .send({
        userId: 'abcd123455',
        butterflyId: 'wxyz9876',
        rating: 6
      });
    expect(response.status).toBe(400);
    expect(response.body).toEqual(
      {
        error: 'invalid request body'
      }
    );
  });

  it('user id doesnot exist in the system expecting invalid field details response(data validation) ', async () => {
    const response = await request(app)
      .put('/ratings')
      .send({
        userId: 'abcd123455',
        butterflyId: 'wxyz9876',
        rating: 5
      });
    expect(response.status).toBe(401);
    expect(response.body).toEqual(
      {
        error: 'Invalid field details {"id":"abcd123455"}'
      }
    );
  });

  it('butteflyid does not exist in the system  expecting invalid field details response (data validation)  ', async () => {
    const response = await request(app)
      .put('/ratings')
      .send({
        userId: '',
        butterflyId: 'wxyz987996',
        rating: 5
      });
    expect(response.status).toBe(401);
    expect(response.body).toEqual(
      {
        error: 'Invalid field details {"id":"wxyz987996"}'
      }
    );
  });
});


describe('Get rating', () => {
  it('invalid userId details, expected to give 404 response, ', async () => {
    const response = await request(app)
      .get('/ratings/138499')
      .send();
    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: 'not found'
    });
  });
  it('valid userId, expected valid JSON response with all the rating that the user gave in sorted order', async () => {

    const mockRatings = [

      { userId: 'abcd1234', butterflyId: 'wxyz9876', rating: 5 },
      { userId: 'abcd1234', butterflyId: 'xRKSdjkBt4', rating: 4 },
      { userId: 'abcd1234', butterflyId: 'DCenP4kQNQ', rating: 1 }
    ];
    const responseForInsert = await request(app)
      .put('/ratings')
      .send( { userId: 'abcd1234', butterflyId: 'DCenP4kQNQ', rating: 1 });
    const response = await request(app)
      .get('/ratings/abcd1234')
      .send();
    expect(responseForInsert.status).toBe(200);
    expect(responseForInsert.body).toEqual({ message: 'successfully updated' });
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockRatings);
  });
});
