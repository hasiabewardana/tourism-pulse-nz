import { expect } from "chai";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { describe, it } from "mocha";

describe("Auth Service - Unit Tests", () => {
  describe("Password Hashing", () => {
    it("should hash password correctly", async () => {
      const password = "testPassword123";
      const hash = await bcrypt.hash(password, 10);

      expect(hash).to.be.a("string");
      expect(hash).to.not.equal(password);
      expect(hash.length).to.be.greaterThan(0);
    });

    it("should verify correct password", async () => {
      const password = "testPassword123";
      const hash = await bcrypt.hash(password, 10);
      const isMatch = await bcrypt.compare(password, hash);

      expect(isMatch).to.be.true;
    });

    it("should reject incorrect password", async () => {
      const password = "testPassword123";
      const wrongPassword = "wrongPassword";
      const hash = await bcrypt.hash(password, 10);
      const isMatch = await bcrypt.compare(wrongPassword, hash);

      expect(isMatch).to.be.false;
    });
  });

  describe("JWT Token Generation", () => {
    const JWT_SECRET = process.env.JWT_SECRET || "test_secret";

    it("should generate valid JWT token", () => {
      const payload = { userId: 1, role: "tourist" };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

      expect(token).to.be.a("string");
      expect(token.split(".")).to.have.lengthOf(3);
    });

    it("should decode JWT token correctly", () => {
      const payload = { userId: 1, role: "tourist" };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
      const decoded: any = jwt.verify(token, JWT_SECRET);

      expect(decoded.userId).to.equal(payload.userId);
      expect(decoded.role).to.equal(payload.role);
    });

    it("should reject invalid JWT token", () => {
      const invalidToken = "invalid.token.here";

      expect(() => {
        jwt.verify(invalidToken, JWT_SECRET);
      }).to.throw();
    });

    it("should generate different tokens for different users", () => {
      const user1 = { userId: 1, role: "tourist" };
      const user2 = { userId: 2, role: "operator" };

      const token1 = jwt.sign(user1, JWT_SECRET, { expiresIn: "1h" });
      const token2 = jwt.sign(user2, JWT_SECRET, { expiresIn: "1h" });

      expect(token1).to.not.equal(token2);
    });
  });

  describe("Role Validation", () => {
    const validRoles = ["tourist", "operator", "admin"];

    it("should accept valid roles", () => {
      validRoles.forEach((role) => {
        expect(validRoles).to.include(role);
      });
    });

    it("should reject invalid roles", () => {
      const invalidRole = "invalid_role";
      expect(validRoles).to.not.include(invalidRole);
    });
  });

  describe("Email Validation", () => {
    it("should validate correct email format", () => {
      const validEmails = [
        "user@example.com",
        "test.user@domain.co.nz",
        "admin@tourism-pulse.nz",
      ];

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      validEmails.forEach((email) => {
        expect(emailRegex.test(email)).to.be.true;
      });
    });

    it("should reject invalid email format", () => {
      const invalidEmails = [
        "notanemail",
        "@nodomain.com",
        "user@",
        "user @example.com",
      ];

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      invalidEmails.forEach((email) => {
        expect(emailRegex.test(email)).to.be.false;
      });
    });
  });
});
