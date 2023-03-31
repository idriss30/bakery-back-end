# bakery-back-end

I built a backend server with Express that interacts with a sqlite database.

The main goal was to prevent regression by implementing unit, integration, and end-to-end tests.

It covers some common problems you might encounter while testing backend applications, such as

integrating a database and a third-party api,

dealing with tests that rely on time and so on.

Tests are performed with jest, supertest, and nock.

# to get started
git clone https://github.com/idriss30/bakery-back-end.git
npm run test 
npm run test --coverage


