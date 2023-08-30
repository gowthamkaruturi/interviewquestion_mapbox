'use strict';

const { upsertRating, getRatings, insertUser } = require('../src/service');
const low = require('lowdb');
const MemoryAdapter = require('lowdb/adapters/Memory');

describe('Insert user Function', () => {
  let db;
  beforeAll(() => {
    const adapter = new MemoryAdapter();
    db = low(adapter);
    db.defaults({
      butterflies: [
        {
          id: 'wxyz9876',
          commonName: 'test-butterfly',
          species: 'Testium butterflius',
          article: 'https://example.com/testium_butterflius'
        }
      ],
      users: [
        {
          id: 'abcd1234',
          username: 'test-user'
        }
      ],
      ratings: [
        {
          userId: 'abcd1234',
          butterflyId: 'wxyz9876',
          rating: 5
        }
      ]
    }).write();
  });

  afterEach(() => {
    db.get('collectionName').remove().write();
  });

  it('should insert data into the collection and return the response', async () => {
    const data = { username: 'John', id: 'abcd123' };

    const result = await insertUser(db, data);

    expect(result).toEqual({ 'id': 'abcd123', 'username': 'John' });
  });

});


describe('insert/upsert Rating', () => {
  let db;
  beforeAll(() => {
    // Create an in-memory database for testing
    const adapter = new MemoryAdapter();
    db = low(adapter);
    db.defaults({
      butterflies: [
        {
          id: 'wxyz9876',
          commonName: 'test-butterfly',
          species: 'Testium butterflius',
          article: 'https://example.com/testium_butterflius'
        }
      ],
      users: [
        {
          id: 'abcd1234',
          username: 'test-user'
        }
      ],
      ratings: [
        {
          userId: 'abcd1234',
          butterflyId: 'wxyz9876',
          rating: 5
        }
      ]
    }).write();
  });

  it('should update the rating when butterfly and user fields are valid', async () => {
    // Arrange
    // Add some initial data to the database
    db.get('butterflies').push({ id: 'butterfly1', commonName: 'Butterfly' }).write();
    db.get('users').push({ id: 'user2', username: 'User' }).write();
    const newRating = {
      butterflyId: 'wxyz9876',
      userId: 'abcd1234',
      rating: 5
    };
    // Act
    const result = await upsertRating(db, newRating);
    // Assert
    expect(result).toEqual(newRating);
  });

  it('should throw an error when butterflyId does not exist in the database', async () => {
    // Arrange
    // Add some initial data to the database
    db.get('users').push({ id: '2', username: 'User' }).write();
    const newRating = {
      butterflyId: '1',
      userId: '2',
      rating: 5
    };
    // Act & Assert
    await expect(upsertRating(db, newRating)).rejects.toThrowError(
      `Invalid field details ${JSON.stringify({
        id: newRating.butterflyId
      })}`
    );
  });

  it('should throw an error when userId does not exist in the database', async () => {
    // Arrange
    // Add some initial data to the database
    db.get('butterflies').push({ id: '1', name: 'Butterfly' }).write();

    const newRating = {
      butterflyId: '1',
      userId: 5,
      rating: 5
    };

    // Act & Assert
    await expect(upsertRating(db, newRating)).rejects.toThrow(
      `Invalid field details ${JSON.stringify({
        id: newRating.userId
      })}`
    );
  });

  it('should update the exiting rating for valid  user id and butterfly id', async () => {
    // Act & Assert
    const result = await upsertRating(db,{ userId:'abcd1234' ,butterflyId:'wxyz9876',rating:4 });
    expect(result).toEqual({ userId: 'abcd1234',butterflyId: 'wxyz9876',rating: 4 });
  });

  it('raise an exception for invalid  user and butterfly details', async () => {
    // Act & Assert
    const newRating = { userId:'abcd1235' ,butterflyId:'wx9z9876',rating:5 };
    let result = null;
    try {
      result = await upsertRating(db, newRating);
    } catch (error){
      result = error;
    }
    expect(result instanceof Error).toBe(true);

  });
});


describe('getRatings' ,() =>{
  let db;
  beforeAll(() => {
    // Create an in-memory database for testing
    const adapter = new MemoryAdapter();
    db = low(adapter);
    db.defaults({
      butterflies: [
        {
          id: 'wxyz9876',
          commonName: 'test-butterfly',
          species: 'Testium butterflius',
          article: 'https://example.com/testium_butterflius'
        }
      ],
      users: [
        {
          id: 'abcd1234',
          username: 'test-user'
        }
      ],
      ratings: [
        {
          userId: 'abcd1234',
          butterflyId: 'wxyz9876',
          rating: 5
        }
      ]
    }).write();
  });
  it('should respond with data if value exists in the databases for rating by an existing user id', async () => {
    // Act & Assert
    const result = await getRatings(db, { userId:'abcd1234' });
    expect(result).toEqual([{ userId: 'abcd1234',butterflyId: 'wxyz9876',rating: 5 }]);
  });
  it('should return empty response, if there are rating for the user', async () => {

    // Act & Assert
    const result = await getRatings(db,{ userId:'abcd12346' });
    expect(result).toEqual(
      []
    );
  });

  it('should respond with empty data for non existing user id', async () => {

    // Act & Assert
    const result = await getRatings(db,{ userId:'abcd134' }, 'asc');
    expect(result).toEqual([]);
  });
  it('should respond with empty data if value exists in the databases for rating by an existing user id', async () => {
    // Arrange
    // Add some initial data to the database
    db.get('users').push({ id: '2', username: 'User' }).write();

    // Act & Assert
    const result = await getRatings(db,{ userId:'abcd134' }, 'asc');
    expect(result).toEqual([]);
  });

});


