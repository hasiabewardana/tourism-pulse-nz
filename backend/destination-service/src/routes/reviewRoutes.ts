import { Router } from "express";
import * as reviewController from "../controllers/reviewController";

const router = Router();

router.get("/v1/reviews", reviewController.getAllReviews);
router.get("/v1/reviews/featured", reviewController.getFeaturedReviews);
router.get(
  "/v1/destinations/:destinationId/reviews",
  reviewController.getReviewsByDestination
);
router.get("/v1/users/:userId/reviews", reviewController.getReviewsByUser);
router.post("/v1/reviews", reviewController.createReview);
router.put("/v1/reviews/:reviewId", reviewController.updateReview);
router.delete("/v1/reviews/:reviewId", reviewController.deleteReview);
router.patch(
  "/v1/reviews/:reviewId/featured",
  reviewController.toggleFeaturedReview
);

export default router;
