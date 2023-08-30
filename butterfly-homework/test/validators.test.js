'use strict';

const { validateButterfly, validateUser, validateRating } = require('../src/validators');

describe('validateButterfly', () => {
  const validButterfly = {
    commonName: 'Butterfly Name',
    species: 'Species name',
    article: 'http://example.com/article'
  };

  it('is ok for a valid butterfly', () => {
    const result = validateButterfly(validButterfly);
    expect(result).toBe(undefined);
  });

  it('throws an error when invalid', () => {
    expect(() => {
      validateButterfly({});
    }).toThrow('The following properties have invalid values:');

    expect(() => {
      validateButterfly({
        ...validButterfly,
        commonName: 123
      });
    }).toThrow('commonName must be a string.');

    expect(() => {
      validateButterfly({
        extra: 'field',
        ...validButterfly
      });
    }).toThrow('The following keys are invalid: extra');
  });
});

describe('validateUser', () => {
  const validUser = {
    username: 'test-user'
  };

  it('is ok for a valid user', () => {
    const result = validateUser(validUser);
    expect(result).toBe(undefined);
  });

  it('throws an error when invalid', () => {
    expect(() => {
      validateUser({});
    }).toThrow('username is required');

    expect(() => {
      validateUser({
        extra: 'field',
        ...validUser
      });
    }).toThrow('The following keys are invalid: extra');

    expect(() => {
      validateUser({
        username: [555]
      });
    }).toThrow('username must be a string');
  });
});


describe('validateRating', () => {
  const rating = {
    userId: 'randomString1',
    butterflyId: 'randomString1',
    rating: 5
  };
  it('is ok for a valid user', () => {
    const result = validateRating(rating);
    expect(result).toBe(undefined);
  });

  it('throws an error when invalid', () => {
    expect(() => {
      validateRating({
        'butterflyId': 'randomString1',
        'rating': 5
      });
    }).toThrow('userId is required');
    expect(() => {
      validateRating({
        'userId': 'randomString1',
        'rating': 5
      });
    }).toThrow('butterflyId is required');
    expect(() => {
      validateRating({
        'butterflyId': 'randomString1',
        'userId': 'randomString2',
        'rating': 9
      });
    }).toThrow('rating must be a number between 0 & 5 (inclusive).');
    expect(() => {
      validateRating({
        extra: 'field',
        ...rating
      });
    }).toThrow('The following keys are invalid: extra');

    expect(() => {
      validateRating({
        userId: 12364647
      });
    }).toThrow('userId must be a string');
    expect(() => {
      validateRating({
        butterflyId: 12364647
      });
    }).toThrow('butterflyId must be a string');
  });
});
