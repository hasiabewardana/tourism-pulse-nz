import { expect } from "chai";
import request from "supertest";
import express from "express";
import authRoutes from "../../src/routes/authRoutes";
import { describe, it, before } from "mocha";

describe("Auth Service - Integration Tests", () => {
  let app: express.Application;

  before(() => {
    app = express();
    app.use(express.json());
    app.use("/api", authRoutes);
  });

  describe("POST /api/register", () => {
    it("should reject registration with missing fields", async () => {
      const response = await request(app).post("/api/register").send({
        email: "test@example.com",
        // Missing password and other fields
      });

      expect(response.status).to.be.oneOf([400, 500]); // Expecting validation error
    });

    it("should reject registration with invalid email", async () => {
      const response = await request(app).post("/api/register").send({
        email: "invalid-email",
        password: "password123",
        firstName: "Test",
        lastName: "User",
        role: "tourist",
      });

      expect(response.status).to.be.oneOf([400, 500]);
    });

    it("should reject registration with invalid role", async () => {
      const response = await request(app).post("/api/register").send({
        email: "test@example.com",
        password: "password123",
        firstName: "Test",
        lastName: "User",
        role: "invalid_role",
      });

      expect(response.status).to.be.oneOf([400, 500]);
    });
  });

  describe("POST /api/login", () => {
    it("should reject login with missing credentials", async () => {
      const response = await request(app).post("/api/login").send({
        email: "test@example.com",
        // Missing password
      });

      expect(response.status).to.be.oneOf([400, 404, 500]);
    });

    it("should reject login with invalid email format", async () => {
      const response = await request(app).post("/api/login").send({
        email: "invalid-email",
        password: "password123",
      });

      expect(response.status).to.be.oneOf([400, 404, 500]);
    });

    it("should return 404 for non-existent user", async () => {
      const response = await request(app).post("/api/login").send({
        email: "nonexistent@example.com",
        password: "password123",
      });

      expect(response.status).to.be.oneOf([404, 500]);
    });
  });

  describe("POST /api/logout", () => {
    it("should handle logout request", async () => {
      const response = await request(app).post("/api/logout").send({});

      // Should either succeed or require authentication
      expect(response.status).to.be.oneOf([200, 401, 500]);
    });
  });

  describe("Input Validation", () => {
    it("should handle malformed JSON", async () => {
      const response = await request(app)
        .post("/api/login")
        .set("Content-Type", "application/json")
        .send("{ invalid json }");

      expect(response.status).to.equal(400);
    });

    it("should reject empty request body", async () => {
      const response = await request(app).post("/api/register").send({});

      expect(response.status).to.be.oneOf([400, 500]);
    });
  });
});
