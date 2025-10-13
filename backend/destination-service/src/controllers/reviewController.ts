import { Request, Response } from "express";
import * as reviewModel from "../models/reviewModel";

export const getAllReviews = async (req: Request, res: Response) => {
  try {
    const reviews = await reviewModel.getAllReviews();
    res.json(reviews);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getFeaturedReviews = async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 6;
    const reviews = await reviewModel.getFeaturedReviews(limit);
    res.json(reviews);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getReviewsByDestination = async (req: Request, res: Response) => {
  try {
    const { destinationId } = req.params;
    const reviews = await reviewModel.getReviewsByDestination(
      parseInt(destinationId)
    );
    res.json(reviews);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getReviewsByUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const reviews = await reviewModel.getReviewsByUserId(parseInt(userId));
    res.json(reviews);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createReview = async (req: Request, res: Response) => {
  try {
    const { bookingId, userId, destinationId, rating, comment } = req.body;

    if (!bookingId || !userId || !destinationId || !rating || !comment) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    const existingReview = await reviewModel.checkExistingReview(bookingId);
    if (existingReview) {
      return res
        .status(400)
        .json({ error: "Review already exists for this booking" });
    }

    const newReview = await reviewModel.createReview(
      bookingId,
      userId,
      destinationId,
      rating,
      comment
    );

    res.status(201).json(newReview);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateReview = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    const updatedReview = await reviewModel.updateReview(
      parseInt(reviewId),
      rating,
      comment
    );

    res.json(updatedReview);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteReview = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;
    await reviewModel.deleteReview(parseInt(reviewId));
    res.json({ message: "Review deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const toggleFeaturedReview = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;
    const { isFeatured } = req.body;

    const updatedReview = await reviewModel.toggleFeaturedReview(
      parseInt(reviewId),
      isFeatured
    );

    res.json(updatedReview);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
