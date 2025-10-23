INSERT INTO dest.reviews (booking_id, user_id, destination_id, rating, comment, is_featured, created_at) VALUES
(1, 1, 1, 5, 'TourismPulseNZ made planning my trip so easy! The real-time updates were incredibly helpful.', TRUE, NOW() - INTERVAL '10 days'),
(2, 2, 2, 5, 'Real-time updates saved our business during peak season. Highly recommend this platform!', TRUE, NOW() - INTERVAL '8 days'),
(3, 3, 3, 4, 'Great experience overall. The booking process was smooth and efficient.', TRUE, NOW() - INTERVAL '6 days'),
(4, 1, 4, 5, 'Amazing destinations and excellent service. Will definitely use again!', TRUE, NOW() - INTERVAL '5 days'),
(5, 2, 5, 4, 'Very satisfied with the platform. Easy to use and reliable information.', TRUE, NOW() - INTERVAL '3 days'),
(6, 3, 1, 5, 'Best travel planning tool I have used. The capacity tracking is a game changer!', TRUE, NOW() - INTERVAL '1 day');
