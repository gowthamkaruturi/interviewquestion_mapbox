- # Approach
- The changes to handle Butterfly critique API are as follows.
- Introduced two endpoints to handle ratings.
    - PUT ratings.
      - this handles the upsert of ratings by an existing user
      - input => {userId, butterflyId, rating}
      - description =>
            - userId => existing user id.
            - butterflyId => existing butterflyId.
            - rating => anything between 0 to 5.
        - output => 
            - case 1: "successfully updated", whenever the input is proper.
            - case 2: "invalid request body", when input validation.
            - case 3: "Invalid field details, when user and butterfly validation fails.
    -  GET ratings.
        - input => {userId}
        - params => order (asc or desc)
        - description =>
            - userId => existing user id.
            - order => asc or desc
        - output =>
            - case 1: "[]"list of ratings given by a user in descending or ascending order, by default the user would be getting results in descending order until specified.
            - case 2: not found, if the user does not exist.

 - ## DB changes
    - Introduced a new table to store and retrieve the ratings.
    - The columns of the table
        - userId => represents the foreign key (referential integrity) from the user table id column
        - butterflyId => represents the foreign key (referential integrity) from butterflyId table id column
        - rating => number within a range of 0 to 5.

- # Additional changes or trade-offs
  ## Pattern changes
    - Introduced MVC pattern in the code by implementing additional service and db layers.
    - Moved database logic to db.js and controller kind of logic to service.js 
    - The DB layer is isolated for db functionality. Using this, we can introduce any additional db-related activities into the db layer(db.js)
    - service layer would act as both controller and model. Using this, we can introduce any new APIS in the service layer that interacts with db or any additional API in future(service.js).
 
- # Explaination for  HTTP verbs used in newly introduced APIS.
  ## PUT for /ratings.
    - Utilizing `put` gives the flexibility to insert, update, or upsert the whole record.
    - This gives the flexibility to override the user's existing rating on a butterfly or insert a new record.
    - we can utilize the `patch` verb to update a fraction of the ratings data, but this introduces an additional route that duplicates the same code to achieve the little functionality.
  ## GET for /ratings
    - Utilized get HTTP verb to fetch the ratings given by the user id.

- # Additional features.
    - we can add new column named `ratings` to the existing butterfly table and update it , when a user gives rating to a butterfly by calculating the overall average of ratings given to it until then.
    - - This gives flexibility for the users to have an idea of the rating of the butterfly.
    - we can stop the users to re-register again. 
    - we can add additonal API to delete the user and butterflies.
- # Test coverage
----------------|---------|----------|---------|---------|-------------------
File           | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
---------------|---------|----------|---------|---------|-------------------
All files      |   96.85 |    90.48 |   95.83 |    97.6 |                   
 constants.js  |     100 |      100 |     100 |     100 |                   
 db.js         |     100 |      100 |     100 |     100 |                   
 index.js      |   95.38 |    84.62 |     100 |   95.38 | 33,87,145         
 service.js    |   97.37 |      100 |   90.91 |     100 |                   
 validators.js |     100 |      100 |     100 |     100 |                   
---------------|---------|----------|---------|---------|-------------------