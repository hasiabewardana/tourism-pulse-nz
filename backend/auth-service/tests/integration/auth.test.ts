import { expect } from "chai";
import request from "supertest";
import express from "express";
import authRoutes from "../../src/routes/authRoutes";

describe("Auth Service - Integration Tests", () => {
  let app: express.Application;

  before(() => {
    app = express();
    app.use(express.json());
    app.use("/api", authRoutes);
  });

  describe("POST /api/register", () => {
    it("should validate required fields", async () => {
      const res = await request(app).post("/api/register").send({
        email: "test@example.com",
      });

      expect(res.status).to.equal(400);
    });

    it("should reject invalid email format", async () => {
      const res = await request(app).post("/api/register").send({
        email: "invalid-email",
        password: "Password123!",
        firstName: "Test",
        lastName: "User",
        role: "tourist",
      });

      expect(res.status).to.equal(400);
    });

    it("should reject weak password", async () => {
      const res = await request(app).post("/api/register").send({
        email: "test@example.com",
        password: "weak",
        firstName: "Test",
        lastName: "User",
        role: "tourist",
      });

      expect(res.status).to.equal(400);
    });
  });

  describe("POST /api/login", () => {
    it("should validate required fields", async () => {
      const res = await request(app).post("/api/login").send({
        email: "test@example.com",
      });

      expect(res.status).to.equal(400);
    });

    it("should reject invalid email format", async () => {
      const res = await request(app).post("/api/login").send({
        email: "invalid-email",
        password: "Password123!",
      });

      expect(res.status).to.equal(400);
    });
  });
});
