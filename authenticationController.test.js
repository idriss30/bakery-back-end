const crypto = require("crypto");
const {
  hashedPassword,
  credentialsAreValid,
  authenticationMiddleware,
} = require("./authenticationController");

const { user: globalUser } = require("./userUtils");

describe("testing users features", () => {
  test("hashing passwords", async () => {
    const passwordToHash = "password_test";
    const hashForPassword = crypto.createHash("sha256");
    hashForPassword.update(passwordToHash);
    const expectedPassword = hashForPassword.digest("hex");
    const actualPassword = hashedPassword("password_test");

    expect(expectedPassword).toEqual(actualPassword);
  });

  test("validating credentials (credentialsAreValid)", async () => {
    const checkCredentials = await credentialsAreValid(
      globalUser.username,
      globalUser.password
    );
    expect(checkCredentials).toBe(true);
  });

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
    const mockedReq = () => {
      const req = {
        headers: { authorization: globalUser.authHeader },
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
