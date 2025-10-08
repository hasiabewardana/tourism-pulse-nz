import { expect } from "chai";
import sinon from "sinon";
import { Request, Response } from "express";
import {
  addBooking,
  removeBooking,
} from "../../src/controllers/bookingController";
import * as bookingModel from "../../src/models/bookingModel";

describe("Booking Controller - Unit Tests", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusStub: sinon.SinonStub;
  let jsonStub: sinon.SinonStub;
  let endStub: sinon.SinonStub;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
    };
    jsonStub = sinon.stub();
    endStub = sinon.stub();
    statusStub = sinon.stub().returns({ json: jsonStub, end: endStub });
    res = {
      status: statusStub,
      json: jsonStub,
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("addBooking", () => {
    it("should create a booking successfully", async () => {
      req.body = {
        offerId: 1,
        userId: 1,
        bookingDate: "2025-10-15T10:00:00Z",
        visitorCount: 2,
        status: "confirmed",
      };

      const mockOffer = {
        offer_id: 1,
        operator_id: 1,
        price: 50,
        available_from: new Date(),
        available_to: new Date(),
        created_at: new Date(),
      };

      sinon.stub(bookingModel, "getOfferById").resolves(mockOffer);
      sinon.stub(bookingModel, "createBooking").resolves(100);

      await addBooking(req as Request, res as Response);

      expect(statusStub.calledWith(201)).to.be.true;
      expect(
        jsonStub.calledWith({
          bookingId: 100,
          message: "Booking created successfully",
        })
      ).to.be.true;
    });

    it("should return 400 if userId is missing", async () => {
      req.body = {
        offerId: 1,
        bookingDate: "2025-10-15T10:00:00Z",
        visitorCount: 2,
      };

      await addBooking(req as Request, res as Response);

      expect(statusStub.calledWith(400)).to.be.true;
    });

    it("should return 404 if offer not found", async () => {
      req.body = {
        offerId: 999,
        userId: 1,
        bookingDate: "2025-10-15T10:00:00Z",
        visitorCount: 2,
      };

      sinon.stub(bookingModel, "getOfferById").resolves(null);

      await addBooking(req as Request, res as Response);

      expect(statusStub.calledWith(404)).to.be.true;
      expect(jsonStub.calledWith({ error: "Offer not found" })).to.be.true;
    });

    it("should calculate price correctly based on visitor count", async () => {
      req.body = {
        offerId: 1,
        userId: 1,
        bookingDate: "2025-10-15T10:00:00Z",
        visitorCount: 3,
        status: "confirmed",
      };

      const mockOffer = {
        offer_id: 1,
        operator_id: 1,
        price: 50,
        available_from: new Date(),
        available_to: new Date(),
        created_at: new Date(),
      };

      sinon.stub(bookingModel, "getOfferById").resolves(mockOffer);
      const createBookingStub = sinon
        .stub(bookingModel, "createBooking")
        .resolves(100);

      await addBooking(req as Request, res as Response);

      // Verify that price was calculated as 50 * 3 = 150
      expect(createBookingStub.calledOnce).to.be.true;
      const callArgs = createBookingStub.firstCall.args;
      expect(callArgs[5]).to.equal(150); // price argument
    });
  });

  describe("removeBooking", () => {
    it("should delete a booking successfully", async () => {
      req.params = { id: "1" };

      const mockBooking = {
        booking_id: 1,
        offer_id: 1,
        user_id: 1,
        booking_date: new Date(),
        visitor_count: 2,
        status: "confirmed",
        price: 100,
        operator_id: 1,
        created_at: new Date(),
      };

      sinon.stub(bookingModel, "findBookingById").resolves(mockBooking);
      sinon.stub(bookingModel, "deleteBooking").resolves();

      await removeBooking(req as Request, res as Response);

      expect(statusStub.calledWith(204)).to.be.true;
    });

    it("should return 404 if booking not found", async () => {
      req.params = { id: "999" };

      sinon.stub(bookingModel, "findBookingById").resolves(null);

      await removeBooking(req as Request, res as Response);

      expect(statusStub.calledWith(404)).to.be.true;
      expect(jsonStub.calledWith({ error: "Booking not found" })).to.be.true;
    });
  });
});
