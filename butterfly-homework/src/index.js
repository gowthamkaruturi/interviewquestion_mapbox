'use strict';
const express = require('express');
const lowdb = require('lowdb');
const FileAsync = require('lowdb/adapters/FileAsync');
const shortid = require('shortid');
const constants = require('./constants');
const { validateButterfly, validateUser, validateRating } = require('./validators');
const { upsertRating, insertUser, insertButterFly, getButterFlies, getUsers, getRatings } = require('./service');
const _ = require('lodash');

async function createApp(dbPath) {
  const app = express();
  app.use(express.json());
  const db = await lowdb(new FileAsync(dbPath));
  await db.read();
  app.get('/', (req, res) => {
    res.json({ message: 'Server is running!' });
  });
  /* ----- BUTTERFLIES ----- */
  /**
   * Get an existing butterfly
   * GET
   */
  app.get('/butterflies/:id', async (req, res) => {
    const params = { id: req.params.id };
    try {
      const butterfly = await getButterFlies(db, params);
      if (_.isEmpty(butterfly)) {
        return res.status(404).json({ error: 'Not found' });
      }
      res.json(butterfly);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  /**
   * Create a new butterfly
   * POST
   */
  app.post('/butterflies', async (req, res) => {
    try {
      validateButterfly(req.body);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid request body' });
    }
    const newButterfly = {
      id: shortid.generate(),
      ...req.body
    };
    const response = await insertButterFly(db, newButterfly);
    res.json(response);
  });

  /* ----- USERS ----- */
  /**
   * Get an existing user
   * GET
   */
  app.get('/users/:id', async (req, res) => {
    const params = { id: req.params.id };
    const user = await getUsers(db, params);
    if (_.isEmpty(user)) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json(user);

  });

  /**
   * Create a new user, by checking if there is a user that is already existing
   * POST
   */
  app.post('/users', async (req, res) => {
    try {
      validateUser(req.body);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid request body' });
    }
    const newUser = {
      id: shortid.generate(),
      ...req.body
    };
    const response = await insertUser(db, newUser);
    if (!_.isEmpty(response)) {
      return res.json(newUser);
    }
    return res.status(400).json({ message: 'failed to store the users in the backend' });
  });

  /* ----- RATINGS ----- */
  /**
    * get list of rating per user
    * GET
    */

  app.get('/ratings/:userid', async (req, res) => {
    // Get the user id from the request parameters
    const params = { userId: req.params.userid };

    // Get the sorting order from the query parameters (default: 'desc')
    const order = req.query.order || 'desc';

    // Retrieve ratings from the database based on the user id
    const ratings = await getRatings(db, params, order);

    // Check if any ratings are found
    if (ratings.length > 0) {
      // Return the sorted ratings as a JSON response with HTTP status 200
      return res.status(200).json(ratings);
    } else {
      // If no ratings are found, return a 'not found' error as a JSON response with HTTP status 404
      res.status(404).json({ error: 'not found' });
    }
  });

  /**
    * Create a new rating
    * PUT
    *
    */

  app.put('/ratings', async (req, res) => {
    try {
      // Validate the request body using the validateRating function
      validateRating(req.body);
    } catch (error) {
      // If validation fails, send a 400 Bad Request response with an error message
      return res.status(400).json({ error: 'invalid request body' });
    }

    // Create a newRating object by spreading the properties from the request body
    const newRating = {
      ...req.body
    };

    try {
      // Call the updateRating function with the newRating object and the db parameter
      const result = await upsertRating(db, newRating);

      // If the result is not empty, send a 200 OK response with a success message
      if (!_.isEmpty(result)) {
        return res.status(200).json({ message: 'successfully updated' });
      }

      // If the result is empty, send a 400 Bad Request response with an error message
      return res.status(400).json({ error: 'invalid request' });
    } catch (error) {
      // If an error occurs during the updateRating function call, send a 401 Unauthorized response with the error message
      return res.status(401).json({ error: error.message });
    }
  });
  return app;
}



/* istanbul ignore if */
if (require.main === module) {
  (async () => {
    const app = await createApp(constants.DB_PATH);
    const port = process.env.PORT || 8000;
    app.listen(port, () => {
      console.log(`Butterfly API started at http://localhost:${port}`);
    });
  })();
}
module.exports = createApp;
