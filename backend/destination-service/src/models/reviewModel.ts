import { query } from "../services/db";

export const getAllReviews = async () => {
  const result = await query(
    `SELECT r.*, u.username, u.email, d.name as destination_name 
     FROM dest.reviews r
     LEFT JOIN auth.users u ON r.user_id = u.user_id
     LEFT JOIN dest.destinations d ON r.destination_id = d.destination_id
     ORDER BY r.created_at DESC`
  );
  return result;
};

export const getFeaturedReviews = async (limit: number = 6) => {
  const result = await query(
    `SELECT r.*, u.username, d.name as destination_name 
     FROM dest.reviews r
     LEFT JOIN auth.users u ON r.user_id = u.user_id
     LEFT JOIN dest.destinations d ON r.destination_id = d.destination_id
     WHERE r.is_featured = TRUE
     ORDER BY r.created_at DESC
     LIMIT $1`,
    [limit]
  );
  return result;
};

export const getReviewsByDestination = async (destinationId: number) => {
  const result = await query(
    `SELECT r.*, u.username 
     FROM dest.reviews r
     LEFT JOIN auth.users u ON r.user_id = u.user_id
     WHERE r.destination_id = $1
     ORDER BY r.created_at DESC`,
    [destinationId]
  );
  return result;
};

export const getReviewsByUserId = async (userId: number) => {
  const result = await query(
    `SELECT r.*, d.name as destination_name 
     FROM dest.reviews r
     LEFT JOIN dest.destinations d ON r.destination_id = d.destination_id
     WHERE r.user_id = $1
     ORDER BY r.created_at DESC`,
    [userId]
  );
  return result;
};

export const getReviewById = async (reviewId: number) => {
  const result = await query(
    `SELECT r.*, u.username, d.name as destination_name 
     FROM dest.reviews r
     LEFT JOIN auth.users u ON r.user_id = u.user_id
     LEFT JOIN dest.destinations d ON r.destination_id = d.destination_id
     WHERE r.review_id = $1`,
    [reviewId]
  );
  return result[0] || null;
};

export const createReview = async (
  bookingId: number,
  userId: number,
  destinationId: number,
  rating: number,
  comment: string
) => {
  const result = await query(
    `INSERT INTO dest.reviews (booking_id, user_id, destination_id, rating, comment)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING review_id`,
    [bookingId, userId, destinationId, rating, comment]
  );
  return result[0].review_id;
};

export const updateReview = async (
  reviewId: number,
  rating?: number,
  comment?: string
) => {
  const fields = [];
  const values = [];
  let index = 1;

  if (rating !== undefined) {
    fields.push(`rating = $${index++}`);
    values.push(rating);
  }

  if (comment !== undefined) {
    fields.push(`comment = $${index++}`);
    values.push(comment);
  }

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(reviewId);

  const result = await query(
    `UPDATE dest.reviews SET ${fields.join(
      ", "
    )} WHERE review_id = $${index} RETURNING *`,
    values
  );

  return result[0];
};

export const deleteReview = async (reviewId: number) => {
  await query("DELETE FROM dest.reviews WHERE review_id = $1", [reviewId]);
};

export const toggleFeaturedReview = async (
  reviewId: number,
  isFeatured: boolean
) => {
  const result = await query(
    `UPDATE dest.reviews SET is_featured = $1, updated_at = CURRENT_TIMESTAMP 
     WHERE review_id = $2 RETURNING *`,
    [isFeatured, reviewId]
  );
  return result[0];
};

export const checkUserBookingForDestination = async (
  userId: number,
  destinationId: number
) => {
  const result = await query(
    `SELECT b.booking_id 
     FROM dest.bookings b
     JOIN dest.offers o ON b.offer_id = o.offer_id
     WHERE b.user_id = $1 AND o.destination_id = $2 AND b.status = 'confirmed'
     LIMIT 1`,
    [userId, destinationId]
  );
  return result[0] || null;
};

export const checkExistingReview = async (bookingId: number) => {
  const result = await query(
    `SELECT review_id FROM dest.reviews WHERE booking_id = $1`,
    [bookingId]
  );
  return result[0] || null;
};
