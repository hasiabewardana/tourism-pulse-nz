import { expect } from "chai";

const request = require("supertest");

describe("Stats NZ Analytics API - Integration Tests", () => {
  const BASE_URL = process.env.ANALYTICS_SERVICE_URL || "http://localhost:3003";

  describe("GET /analytics-service/api/statsnz/enriched-forecast/:region", () => {
    it("should return enriched forecast with Stats NZ data", (done) => {
      request(BASE_URL)
        .get("/analytics-service/api/statsnz/enriched-forecast/auckland")
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);

          expect(res.body).to.have.property("success", true);
          expect(res.body.data).to.have.property("region", "auckland");
          expect(res.body.data).to.have.property("nationalMonthlyAverage");
          expect(res.body.data).to.have.property("nationalGrowthRate");
          expect(res.body.data).to.have.property("recommendation");
          expect(res.body.data).to.have.property("topOriginMarkets");
          expect(Array.isArray(res.body.data.topOriginMarkets)).to.be.true;
          done();
        });
    });

    it("should provide meaningful recommendations", (done) => {
      request(BASE_URL)
        .get("/analytics-service/api/statsnz/enriched-forecast/wellington")
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);

          expect(res.body.data.recommendation).to.be.ok;
          expect(typeof res.body.data.recommendation).to.equal("string");
          expect(res.body.data.recommendation.length).to.be.greaterThan(10);
          done();
        });
    });
  });

  describe("GET /analytics-service/api/statsnz/regional-comparison/:region", () => {
    it("should return regional comparison with benchmarks", (done) => {
      request(BASE_URL)
        .get("/analytics-service/api/statsnz/regional-comparison/canterbury")
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);

          expect(res.body.success).to.be.true;
          expect(res.body.data).to.have.property("region", "canterbury");
          expect(res.body.data).to.have.property("nationalAverageOccupancy");
          expect(res.body.data).to.have.property("nationalAverageStay");
          expect(res.body.data).to.have.property("insights");
          expect(Array.isArray(res.body.data.insights)).to.be.true;
          done();
        });
    });

    it("should return valid occupancy percentages", (done) => {
      request(BASE_URL)
        .get("/analytics-service/api/statsnz/regional-comparison/otago")
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);

          const occupancy = res.body.data.nationalAverageOccupancy;
          expect(occupancy).to.be.at.least(0);
          expect(occupancy).to.be.at.most(100);
          done();
        });
    });

    it("should provide actionable insights", (done) => {
      request(BASE_URL)
        .get("/analytics-service/api/statsnz/regional-comparison/auckland")
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);

          expect(res.body.data.insights.length).to.be.greaterThan(0);
          res.body.data.insights.forEach((insight) => {
            expect(typeof insight).to.equal("string");
            expect(insight.length).to.be.greaterThan(10);
          });
          done();
        });
    });
  });

  describe("GET /analytics-service/api/statsnz/tourism-trends/:region", () => {
    it("should return tourism trends with default months", (done) => {
      request(BASE_URL)
        .get("/analytics-service/api/statsnz/tourism-trends/wellington")
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);

          expect(res.body.success).to.be.true;
          expect(res.body.data).to.have.property("trends");
          expect(Array.isArray(res.body.data.trends)).to.be.true;
          expect(res.body.data.trends.length).to.be.greaterThan(0);
          done();
        });
    });

    it("should support custom month range", (done) => {
      request(BASE_URL)
        .get("/analytics-service/api/statsnz/tourism-trends/auckland?months=3")
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);

          expect(res.body.data.trends.length).to.equal(3);
          done();
        });
    });

    it("should calculate growth metrics", (done) => {
      request(BASE_URL)
        .get("/analytics-service/api/statsnz/tourism-trends/otago?months=6")
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);

          expect(res.body.data).to.have.property("overallGrowth");
          expect(typeof res.body.data.overallGrowth).to.equal("number");
          done();
        });
    });
  });

  describe("Error handling", () => {
    it("should handle invalid region gracefully", (done) => {
      request(BASE_URL)
        .get(
          "/analytics-service/api/statsnz/enriched-forecast/invalid-region-name"
        )
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.success).to.be.true;
          done();
        });
    });

    it("should handle missing month parameter", (done) => {
      request(BASE_URL)
        .get("/analytics-service/api/statsnz/tourism-trends/canterbury")
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.data.trends).to.be.ok;
          done();
        });
    });
  });
});
