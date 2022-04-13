const crypto = require("crypto");
const {
  hashedPassword,
  credentialsAreValid,
  authenticationMiddleware,
  createUser,
} = require("./authenticationController");
const { db } = require("./database/dbConnection");

afterAll(() => db.destroy());

describe("testing users features", () => {
  beforeEach(() => db("users").truncate());

  test("hashing passwords", async () => {
    const passwordToHash = "password_test";
    const hashForPassword = crypto.createHash("sha256");
    hashForPassword.update(passwordToHash);
    const expectedPassword = hashForPassword.digest("hex");
    const actualPassword = hashedPassword("password_test");

    expect(expectedPassword).toEqual(actualPassword);
  });
  test("create user function", async () => {
    const createUserRes = await createUser("test", "123", "test@email.com");
    expect(createUserRes).toBe(true);
  });

  test("existing user ", async () => {
    await db("users").insert({
      username: "test",
      password: "123",
      email: "email@test.com",
    });
    try {
      await createUser("test", "123", "email@test.com");
    } catch (error) {
      const err = new Error("test already exist");
      expect(error).toEqual(err);
    }
    expect.assertions(1);
  });

  test("validating credentials (credentialsAreValid)", async () => {
    await createUser("test", "password123", "test@email.org");
    const checkCredentials = await credentialsAreValid("test", "password123");
    expect(checkCredentials).toBe(true);
  });
});

describe("authentication middleware", () => {
  //integration test
  test("returning error when credentials are not valid", async () => {
    const fakeAuth = Buffer.from("invalid:credentials").toString("base64");

    const mockedRequest = () => {
      const req = {
        headers: { authorization: `Basic ${fakeAuth}` },
      };
      return req;
    };

    const mockedResponse = () => {
      const res = {};
      res.status = jest.fn().mockReturnValue(res);
      res.json = jest.fn().mockReturnValue(res);
      return res;
    };
    const req = mockedRequest(),
      res = mockedResponse(),
      next = jest.fn();

    await authenticationMiddleware(req, res, next);
    expect(next.mock.calls).toHaveLength(0);
    expect(res.json).toHaveBeenCalledWith({
      message: "provide valid credentials",
    });
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("providing valid credentials", async () => {
    await createUser("test_user", "password123", "test_user@email.org");
    const headerAuth = Buffer.from("test_user:password123").toString("base64");
    const mockedReq = () => {
      const req = {
        headers: { authorization: `Basic ${headerAuth}` },
      };

      return req;
    };

    const mockedRes = () => {
      const res = {};
      res.status = jest.fn().mockReturnValue(res);
      res.json = jest.fn().mockReturnValue(res);

      return res;
    };
    const next = jest.fn(),
      req = mockedReq(),
      res = mockedRes();

    await authenticationMiddleware(req, res, next);
    expect(next.mock.calls).toHaveLength(1);
  });
});
