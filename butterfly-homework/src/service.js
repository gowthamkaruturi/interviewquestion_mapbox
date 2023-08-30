'use strict';
const constants = require('./constants');
const { upsert, get, insert, getByFilter } = require('./db');
const _ = require('lodash');




/**
 * This function inserts a new user into the database.
 * @param {db} db - The database connection object.
 * @param {Object} newUser - An object representing the new user to be inserted.
 * @returns {Object} - The newly inserted user object.
 */
async function insertUser(db, newUser) {
  // Insert the new user into the database using the `insert` function
  await insert(db, constants.USERS_TABLE, newUser);

  // Return the newly inserted user object
  return newUser;
}

/**
 * This function retrieves users from the database based on given parameters.
 * @param {db} db - The database connection object.
 * @param {Object} params - An object containing parameter field names and values for the query.
 * @returns {Array} - An array of user records that match the given parameters.
 */
async function getUsers(db, params) {
  // Create an empty query object
  const query = {};

  // Iterate through each key-value pair in the params object and add them to the query object
  Object.entries(params).forEach(([fieldName, fieldValue]) => {
    query[fieldName] = fieldValue;
  });

  // Retrieve user records from the database using the `get` function
  const records = await get(db, constants.USERS_TABLE, query);

  // Return the retrieved user records
  return records;
}

/**
 * This function inserts a new butterfly into the database.
 * @param {db} db - The database connection object.
 * @param {Object} newButterfly - An object representing the new butterfly to be inserted.
 * @returns {Object} - The newly inserted butterfly object.
 */
async function insertButterFly(db, newButterfly) {
  // Insert the new butterfly into the database using the `insert` function
  await insert(db,constants.BUTTERFLIES_TABLE,newButterfly);
  // Return the newly inserted butterfly object
  return newButterfly;
}
/**
 * This function retrieves butterflies from the database based on given parameters.
 * @param {db} db - The database connection object.
 * @param {Object} params - An object containing the parameters for filtering the butterflies.
 * @returns {Array} - An array of butterfly records that match the given parameters.
 */
async function getButterFlies(db, params) {
  // Create an empty query object to store the filter criteria
  const query = {};

  // Iterate over the params object using Object.entries() and assign each key-value pair to the query object
  Object.entries(params).forEach(([fieldName, fieldValue]) => {
    query[fieldName] = fieldValue;
  });

  // Retrieve butterfly records from the database using the `get` function with the specified table and query
  const records = await get(db, constants.BUTTERFLIES_TABLE, query);

  // Return the retrieved butterfly records
  return records;
}

/**
 * This function retrieves ratings from the database based on given parameters and sorts them based on a specific order.
 * @param {db} db - The database connection object.
 * @param {Object} params - An object containing the parameters for filtering the ratings.
 * @param {string} order - The order in which the ratings should be sorted ('asc' or 'desc').
 * @returns {Array} - An array of sorted rating records that match the given parameters.
 */
async function getRatings(db, params, order) {
  // Create an empty query object to store the filter criteria
  const query = {};

  // Iterate through each key-value pair in the params object and assign them to the query object
  Object.entries(params).forEach(([fieldName, fieldValue]) => {
    query[fieldName] = fieldValue;
  });

  // Retrieve rating records from the database using the `getByFilter` function with the specified table and query
  const records = await getByFilter(db, constants.RATINGS_TABLE, query);

  let sortedRatings;
  // Sort the ratings array based on the chosen order
  if (order === 'asc') {
    sortedRatings = records.sort((a, b) => a.rating - b.rating); // Sort in ascending order if order is 'asc'
  } else {
    sortedRatings = records.sort((a, b) => b.rating - a.rating); // Sort in descending order if order is 'desc'
  }

  // Return the sorted ratings array
  return sortedRatings;
}

/**
 * This function upserts a new rating into the database.
 * @param {db} db - The database connection object.
 * @param {Object} newRating - An object containing the details of the new rating.
 * @returns {Promise} - A promise that resolves with the result of the upsert operation.
 */
async function upsertRating(db, newRating) {
  // Create a butterflyFields object with the id field from the newRating object
  const butterflyFields = {
    id: newRating.butterflyId
  };

  // Retrieve the butterfly record from the database using the `get` function with the specified table and fields
  const butterfly = await get(db, 'butterflies', butterflyFields);

  // If no butterfly record is found, throw an error with details of the invalid fields
  if (_.isEmpty(butterfly)) {
    throw new Error(`Invalid field details ${JSON.stringify(butterflyFields)}`);
  }

  // Create a userFields object with the id field from the newRating object
  const userFields = {
    id: newRating.userId
  };

  // Retrieve the user record from the database using the `get` function with the specified table and fields
  const user = await get(db, 'users', userFields);

  // If no user record is found, throw an error with details of the invalid fields
  if (_.isEmpty(user)) {
    throw new Error(`Invalid field details ${JSON.stringify(userFields)}`);
  }

  // Create a ratingsFields object with the userId and butterflyId from the newRating object
  const ratingsFields = {
    userId: newRating.userId,
    butterflyId: newRating.butterflyId
  };

  // Call the `upsert` function to upsert the ratings record in the database and return the result
  return await upsert(db, 'ratings', ratingsFields, newRating);
}

module.exports = {
  upsertRating,
  getButterFlies,
  getUsers,
  getRatings,
  insertButterFly,
  insertUser: insertUser
};
