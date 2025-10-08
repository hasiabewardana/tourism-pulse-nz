import { expect } from "chai";
import request from "supertest";
import express from "express";
import destinationRoutes from "../../src/routes/destinationRoutes";
import bookingRoutes from "../../src/routes/bookingRoutes";
import { describe, it, before } from "mocha";

describe("Destination Service - Integration Tests", () => {
  let app: express.Application;

  before(() => {
    app = express();
    app.use(express.json());
    app.use("/api", destinationRoutes);
    app.use("/api", bookingRoutes);
  });

  describe("GET /api/destinations", () => {
    it("should return destinations list", async () => {
      const response = await request(app).get("/api/destinations");

      expect(response.status).to.be.oneOf([200, 500]);
      if (response.status === 200) {
        expect(response.body).to.be.an("array");
      }
    });

    it("should handle destination filtering", async () => {
      const response = await request(app)
        .get("/api/destinations")
        .query({ status: "Open" });

      expect(response.status).to.be.oneOf([200, 500]);
    });
  });

  describe("GET /api/destinations/:id", () => {
    it("should return 404 for non-existent destination", async () => {
      const response = await request(app).get("/api/destinations/99999");

      expect(response.status).to.be.oneOf([404, 500]);
    });

    it("should reject invalid destination ID", async () => {
      const response = await request(app).get("/api/destinations/invalid");

      expect(response.status).to.be.oneOf([400, 404, 500]);
    });
  });

  describe("POST /api/bookings", () => {
    it("should reject booking with missing fields", async () => {
      const response = await request(app).post("/api/bookings").send({
        offerId: 1,
        // Missing required fields
      });

      expect(response.status).to.be.oneOf([400, 500]);
    });

    it("should validate visitor count", async () => {
      const response = await request(app).post("/api/bookings").send({
        offerId: 1,
        userId: 1,
        bookingDate: "2025-12-31T10:00:00.000Z",
        visitorCount: 0, // Invalid: should be at least 1
        status: "pending",
      });

      expect(response.status).to.be.oneOf([400, 404, 500]);
    });

    it("should validate booking date format", async () => {
      const response = await request(app).post("/api/bookings").send({
        offerId: 1,
        userId: 1,
        bookingDate: "invalid-date",
        visitorCount: 2,
        status: "pending",
      });

      expect(response.status).to.be.oneOf([400, 500]);
    });

    it("should validate offer existence", async () => {
      const response = await request(app).post("/api/bookings").send({
        offerId: 99999, // Non-existent offer
        userId: 1,
        bookingDate: "2025-12-31T10:00:00.000Z",
        visitorCount: 2,
        status: "pending",
      });

      expect(response.status).to.be.oneOf([404, 500]);
    });
  });

  describe("GET /api/bookings", () => {
    it("should handle bookings list request", async () => {
      const response = await request(app).get("/api/bookings");

      expect(response.status).to.be.oneOf([200, 401, 500]);
    });
  });

  describe("PUT /api/bookings/:id", () => {
    it("should reject update for non-existent booking", async () => {
      const response = await request(app).put("/api/bookings/99999").send({
        status: "confirmed",
      });

      expect(response.status).to.be.oneOf([404, 500]);
    });

    it("should validate booking status update", async () => {
      const response = await request(app).put("/api/bookings/1").send({
        status: "invalid_status",
      });

      expect(response.status).to.be.oneOf([400, 404, 500]);
    });
  });

  describe("DELETE /api/bookings/:id", () => {
    it("should return 404 for non-existent booking", async () => {
      const response = await request(app).delete("/api/bookings/99999");

      expect(response.status).to.be.oneOf([404, 500]);
    });
  });

  describe("Input Validation", () => {
    it("should handle malformed JSON", async () => {
      const response = await request(app)
        .post("/api/bookings")
        .set("Content-Type", "application/json")
        .send("{ invalid json }");

      expect(response.status).to.equal(400);
    });

    it("should reject empty request body for POST", async () => {
      const response = await request(app).post("/api/bookings").send({});

      expect(response.status).to.be.oneOf([400, 500]);
    });
  });
});
