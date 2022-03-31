const crypto = require("crypto");
const {
  hashedPassword,
  users,
  credentialsAreValid,
  authenticationMiddleware,
  createUserMock,
  finalAuth,
} = require("./authenticationController");

describe("testing passwords", () => {
  test("hashing passwords", async () => {
    const passwordToHash = "password_test";
    const hashForPassword = crypto.createHash("sha256");
    hashForPassword.update(passwordToHash);
    const expectedPassword = hashForPassword.digest("hex");
    const actualPassword = hashedPassword("password_test");

    expect(expectedPassword).toEqual(actualPassword);
  });
});

describe("credentialAreValid", () => {
  test("validating credentials", () => {
    users.set("test_user", {
      email: "test@email.org",
      password: hashedPassword("pass123"),
    });

    const checkCredentials = credentialsAreValid("test_user", "pass123");
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
    createUserMock();

    const mockedReq = () => {
      const req = {
        headers: { authorization: `${finalAuth}` },
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
