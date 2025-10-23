import { expect } from "chai";
import sinon from "sinon";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { register, login } from "../../src/controllers/authController";
import * as authModel from "../../src/models/authModel";

describe("Auth Controller - Unit Tests", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusStub: sinon.SinonStub;
  let jsonStub: sinon.SinonStub;

  beforeEach(() => {
    req = {
      body: {},
    };
    jsonStub = sinon.stub();
    statusStub = sinon.stub().returns({ json: jsonStub });
    res = {
      status: statusStub,
      json: jsonStub,
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("register", () => {
    it("should register a new user successfully", async () => {
      req.body = {
        email: "test@example.com",
        password: "Password123!",
        firstName: "Test",
        lastName: "User",
        role: "tourist",
      };

      sinon.stub(authModel, "findUserByEmail").resolves(null);
      sinon.stub(bcrypt, "hash").resolves("hashedPassword" as never);
      sinon.stub(authModel, "createUser").resolves(1);

      await register(req as Request, res as Response);

      expect(statusStub.calledWith(201)).to.be.true;
      expect(jsonStub.calledWith({ userId: 1 })).to.be.true;
    });

    it("should return 409 if user already exists", async () => {
      req.body = {
        email: "existing@example.com",
        password: "Password123!",
        firstName: "Test",
        lastName: "User",
        role: "tourist",
      };

      sinon.stub(authModel, "findUserByEmail").resolves({
        user_id: 1,
        email: "existing@example.com",
        password_hash: "hash",
        first_name: "Test",
        last_name: "User",
        role: "tourist",
        created_at: new Date(),
      });

      await register(req as Request, res as Response);

      expect(statusStub.calledWith(409)).to.be.true;
      expect(jsonStub.calledWith({ error: "User already exists" })).to.be.true;
    });

    it("should return 400 for invalid input", async () => {
      req.body = {
        email: "invalid-email",
        password: "short",
      };

      await register(req as Request, res as Response);

      expect(statusStub.calledWith(400)).to.be.true;
    });
  });

  describe("login", () => {
    it("should login user successfully with valid credentials", async () => {
      req.body = {
        email: "test@example.com",
        password: "Password123!",
      };

      const mockUser = {
        user_id: 1,
        email: "test@example.com",
        password_hash: "hashedPassword",
        first_name: "Test",
        last_name: "User",
        role: "tourist",
        created_at: new Date(),
      };

      sinon.stub(authModel, "findUserByEmail").resolves(mockUser);
      sinon.stub(bcrypt, "compare").resolves(true as never);
      sinon.stub(jwt, "sign").returns("mockToken" as any);
      sinon.stub(authModel, "createSession").resolves();

      await login(req as Request, res as Response);

      expect(jsonStub.calledOnce).to.be.true;
      const callArgs = jsonStub.firstCall.args[0];
      expect(callArgs).to.have.property("token", "mockToken");
      expect(callArgs).to.have.property("userId", 1);
      expect(callArgs).to.have.property("role", "tourist");
    });

    it("should return 404 if user not found", async () => {
      req.body = {
        email: "nonexistent@example.com",
        password: "Password123!",
      };

      sinon.stub(authModel, "findUserByEmail").resolves(null);

      await login(req as Request, res as Response);

      expect(statusStub.calledWith(404)).to.be.true;
      expect(jsonStub.calledWith({ error: "User not found" })).to.be.true;
    });

    it("should return 401 for invalid password", async () => {
      req.body = {
        email: "test@example.com",
        password: "WrongPassword",
      };

      const mockUser = {
        user_id: 1,
        email: "test@example.com",
        password_hash: "hashedPassword",
        first_name: "Test",
        last_name: "User",
        role: "tourist",
        created_at: new Date(),
      };

      sinon.stub(authModel, "findUserByEmail").resolves(mockUser);
      sinon.stub(bcrypt, "compare").resolves(false as never);

      await login(req as Request, res as Response);

      expect(statusStub.calledWith(401)).to.be.true;
      expect(jsonStub.calledWith({ error: "Invalid credentials" })).to.be.true;
    });
  });
});
