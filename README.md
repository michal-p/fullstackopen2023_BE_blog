# fullstackopen2023_BE_blog
Fullstackopen blog project

Running tests:
When tests are run with option --test-only, that is, with the command: npm test -- --test-only

The following command only runs the tests found in the tests/note_api.test.js file: npm test -- tests/note_api.test.js

The --tests-by-name-pattern option can be used for running tests with a specific name: npm test -- --test-name-pattern="the first note is about HTTP methods"

The provided argument can refer to the name of the test or the describe block. It can also contain just a part of the name. The following command will run all of the tests that contain notes in their name: npm run test -- --test-name-pattern="notes"

