'use strict';
const _ = require('lodash');

async function upsert(db, collection, params, update) {
  // Create an empty query object
  const query = {};
  let result = null;
  // Iterate through each key-value pair in "params" and add them to the query object
  Object.entries(params).forEach(([fieldName, fieldValue]) => {
    query[fieldName] = fieldValue;
  });

  // Retrieve a record from the given collection based on the query
  const record = await get(db, collection, query);

  if (!_.isEmpty(record)) {
    // If a record is found, update it with the new values
    result = await db.get(collection)
      .find(query)
      .assign(update)
      .write();
  } else {
    // If no record is found, insert a new record with the given values
    result = await insert(db, collection, update);
  }

  // Return the result of the upsert operation
  return result;
}



async function get(db, collection, query){
  // Retrieve records from the given collection based on the query
  const records = await db.get(collection)
    .find(query)
    .value();

  // Return the retrieved records
  return records;
}


async function getByFilter(db, collection, query){
  // Retrieve records from the given collection based on the query
  const records = await db.get(collection)
    .filter(query)
    .value();

  // Return the retrieved records
  return records;
}

async function insert(db, collection, data) {
  // Insert the given data into the specified collection
  const response = await db.get(collection)
    .push(data)
    .write();

  // Return the response from the insertion operation
  return response;
}

module.exports = {
  get,
  insert,
  upsert,
  getByFilter
};
