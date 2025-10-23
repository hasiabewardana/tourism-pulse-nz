import request from "supertest";
const { expect } = require("chai");

describe("Stats NZ API - Integration Tests", () => {
  const BASE_URL =
    process.env.INTEGRATION_SERVICE_URL || "http://localhost:3004";

  describe("GET /integration-service/api/statsnz/tourism/arrivals/:region", () => {
    it("should return tourism arrivals data for a valid region", async () => {
      const response = await request(BASE_URL)
        .get("/integration-service/api/statsnz/tourism/arrivals/auckland")
        .expect(200);

      expect(response.body).to.have.property("success", true);
      expect(response.body).to.have.property("data");
      expect(response.body.data).to.have.property("region", "auckland");
      expect(response.body.data).to.have.property("monthlyArrivals");
      expect(response.body.data).to.have.property("growthRate");
      expect(response.body.data).to.have.property("topOriginCountries");
    });

    it("should handle unknown regions", async () => {
      const response = await request(BASE_URL)
        .get("/integration-service/api/statsnz/tourism/arrivals/unknown")
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.data.region).to.equal("unknown");
    });
  });

  describe("GET /integration-service/api/statsnz/tourism/accommodation/:region", () => {
    it("should return accommodation statistics", async () => {
      const response = await request(BASE_URL)
        .get(
          "/integration-service/api/statsnz/tourism/accommodation/wellington"
        )
        .expect(200);

      expect(response.body).to.have.property("success", true);
      expect(response.body.data).to.have.property("region", "wellington");
      expect(response.body.data).to.have.property("occupancyRate");
      expect(response.body.data).to.have.property("averageStayDuration");
      expect(response.body.data).to.have.property("totalEstablishments");
    });

    it("should return valid occupancy rate range", async () => {
      const response = await request(BASE_URL)
        .get(
          "/integration-service/api/statsnz/tourism/accommodation/canterbury"
        )
        .expect(200);

      expect(response.body.data.occupancyRate).to.be.within(0, 100);
    });
  });

  describe("GET /integration-service/api/statsnz/tourism/trends/:region", () => {
    it("should return trend data with default 6 months", async () => {
      const response = await request(BASE_URL)
        .get("/integration-service/api/statsnz/tourism/trends/otago")
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.data.trends).to.be.an("array");
      expect(response.body.data.trends).to.have.lengthOf(6);
    });

    it("should return trend data with custom month count", async () => {
      const response = await request(BASE_URL)
        .get(
          "/integration-service/api/statsnz/tourism/trends/auckland?months=3"
        )
        .expect(200);

      expect(response.body.data.trends).to.have.lengthOf(3);
    });

    it("should calculate overall growth", async () => {
      const response = await request(BASE_URL)
        .get(
          "/integration-service/api/statsnz/tourism/trends/wellington?months=6"
        )
        .expect(200);

      expect(response.body.data).to.have.property("overallGrowth");
      expect(response.body.data.overallGrowth).to.be.a("number");
    });
  });
});
