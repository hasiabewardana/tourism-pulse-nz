const { expect } = require("chai");
import sinon from "sinon";
const axios = require("axios");
const redis = require("redis");
const statsNZService = require("../../src/services/statsnzService");

describe("Stats NZ Service - Unit Tests", () => {
  let redisStub;
  let axiosStub;

  beforeEach(() => {
    redisStub = {
      get: sinon.stub(),
      setEx: sinon.stub(),
    };
    axiosStub = sinon.stub(axios, "get");
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("getTourismArrivals", () => {
    it("should return cached data if available", async () => {
      const cachedData = JSON.stringify({
        region: "auckland",
        monthlyArrivals: 45000,
      });
      redisStub.get.resolves(cachedData);

      const result = await statsNZService.getTourismArrivals(
        "auckland",
        redisStub
      );

      expect(result.region).to.equal("auckland");
      expect(result.monthlyArrivals).to.equal(45000);
      expect(redisStub.get.calledOnce).to.be.true;
    });

    it("should fetch and cache new data if cache is empty", async () => {
      redisStub.get.resolves(null);

      const result = await statsNZService.getTourismArrivals(
        "wellington",
        redisStub
      );

      expect(result.region).to.equal("wellington");
      expect(result.monthlyArrivals).to.be.a("number");
      expect(result.monthlyArrivals).to.be.above(0);
      expect(result.topOriginCountries).to.be.an("array");
      expect(redisStub.setEx.calledOnce).to.be.true;
    });

    it("should return mock data for known regions", async () => {
      redisStub.get.resolves(null);

      const regions = ["auckland", "wellington", "canterbury", "otago"];

      for (const region of regions) {
        const result = await statsNZService.getTourismArrivals(
          region,
          redisStub
        );
        expect(result.region).to.equal(region);
        expect(result.monthlyArrivals).to.be.a("number");
        expect(result.growthRate).to.be.a("number");
      }
    });

    it("should handle unknown regions gracefully", async () => {
      redisStub.get.resolves(null);

      const result = await statsNZService.getTourismArrivals(
        "unknown-region",
        redisStub
      );

      expect(result.region).to.equal("unknown-region");
      expect(result.monthlyArrivals).to.equal(0);
      expect(result.topOriginCountries).to.be.an("array").that.is.empty;
    });
  });

  describe("getAccommodationStats", () => {
    it("should return valid accommodation statistics", async () => {
      redisStub.get.resolves(null);

      const result = await statsNZService.getAccommodationStats(
        "auckland",
        redisStub
      );

      expect(result.region).to.equal("auckland");
      expect(result.occupancyRate).to.be.a("number");
      expect(result.occupancyRate).to.be.within(0, 100);
      expect(result.averageStayDuration).to.be.a("number");
      expect(result.totalEstablishments).to.be.a("number");
    });

    it("should cache accommodation stats with correct TTL", async () => {
      redisStub.get.resolves(null);

      await statsNZService.getAccommodationStats("canterbury", redisStub);

      expect(redisStub.setEx.calledOnce).to.be.true;
      const cacheCall = redisStub.setEx.getCall(0);
      expect(cacheCall.args[1]).to.equal(86400); // 24 hours TTL
    });

    it("should return different stats for different regions", async () => {
      redisStub.get.resolves(null);

      const aucklandStats = await statsNZService.getAccommodationStats(
        "auckland",
        redisStub
      );
      const wellingtonStats = await statsNZService.getAccommodationStats(
        "wellington",
        redisStub
      );

      expect(aucklandStats.region).to.not.equal(wellingtonStats.region);
      expect(aucklandStats.occupancyRate).to.be.a("number");
      expect(wellingtonStats.occupancyRate).to.be.a("number");
    });
  });

  describe("getRegionalTrends", () => {
    it("should return trend data for specified months", async () => {
      redisStub.get.resolves(null);

      const result = await statsNZService.getRegionalTrends(
        "otago",
        6,
        redisStub
      );

      expect(result.region).to.equal("otago");
      expect(result.trends).to.be.an("array");
      expect(result.trends).to.have.lengthOf(6);
    });

    it("should return trends in chronological order", async () => {
      redisStub.get.resolves(null);

      const result = await statsNZService.getRegionalTrends(
        "auckland",
        3,
        redisStub
      );

      const months = result.trends.map((t) => new Date(t.month));
      for (let i = 1; i < months.length; i++) {
        expect(months[i].getTime()).to.be.greaterThan(months[i - 1].getTime());
      }
    });

    it("should calculate overall growth rate", async () => {
      redisStub.get.resolves(null);

      const result = await statsNZService.getRegionalTrends(
        "canterbury",
        6,
        redisStub
      );

      expect(result.overallGrowth).to.be.a("number");
      expect(result.trends[0].arrivals).to.be.a("number");
      expect(result.trends[0].occupancyRate).to.be.a("number");
    });

    it("should default to 6 months if not specified", async () => {
      redisStub.get.resolves(null);

      const result = await statsNZService.getRegionalTrends(
        "wellington",
        undefined,
        redisStub
      );

      expect(result.trends).to.have.lengthOf(6);
    });

    it("should limit months to maximum of 12", async () => {
      redisStub.get.resolves(null);

      const result = await statsNZService.getRegionalTrends(
        "auckland",
        24,
        redisStub
      );

      expect(result.trends.length).to.be.at.most(12);
    });
  });

  describe("Cache behavior", () => {
    it("should use consistent cache keys", async () => {
      redisStub.get.resolves(null);

      await statsNZService.getTourismArrivals("auckland", redisStub);

      expect(redisStub.get.calledWith("statsnz:arrivals:auckland")).to.be.true;
    });

    it("should set cache expiration to 24 hours", async () => {
      redisStub.get.resolves(null);

      await statsNZService.getTourismArrivals("wellington", redisStub);

      const setExCall = redisStub.setEx.getCall(0);
      expect(setExCall.args[1]).to.equal(86400);
    });
  });

  describe("Error handling", () => {
    it("should handle redis get errors gracefully", async () => {
      redisStub.get.rejects(new Error("Redis connection failed"));

      const result = await statsNZService.getTourismArrivals(
        "auckland",
        redisStub
      );

      expect(result).to.exist;
      expect(result.region).to.equal("auckland");
    });

    it("should handle redis set errors gracefully", async () => {
      redisStub.get.resolves(null);
      redisStub.setEx.rejects(new Error("Redis set failed"));

      const result = await statsNZService.getAccommodationStats(
        "canterbury",
        redisStub
      );

      expect(result).to.exist;
      expect(result.region).to.equal("canterbury");
    });
  });
});
