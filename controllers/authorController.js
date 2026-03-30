import Booking from '../models/bookingModel.js';
import Review from '../models/reviewModel.js';
import Tour from '../models/tourModel.js';
import User from '../models/userModel.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

const verifyBookingOwnership = catchAsync(async (req, res, next) => {
  if (!req.user) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  const currentUserId = req.user.id;
  const bookingId = req.params.bookingId || req.params.id || req.body.booking;

  if (!bookingId) {
    return next(new AppError('You must provide a booking ID', 400));
  }

  const booking = await Booking.findById(bookingId);

  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  // Check ownership - admins can access any booking
  if (booking.user.toString() === currentUserId || req.user.role === 'admin') {
    req.booking = booking;
    return next();
  }

  // Check if user is a lead-guide assigned to the tour
  if (req.user.role === 'lead-guide') {
    const tour = await Tour.findById(booking.tour);
    if (tour) {
      const isAssigned = tour.guides.some(
        (guide) => guide.toString() === currentUserId.toString()
      );
      if (isAssigned) {
        req.booking = booking;
        return next();
      }
    }
  }

  // If none of the above conditions are met, deny access
  return next(
    new AppError('You do not have permission to perform this action', 403)
  );
});

// Verify that user has booked the tour before allowing review
const verifyTourForReview = catchAsync(async (req, res, next) => {
  if (!req.user) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  const currentUserId = req.user.id;
  const tourId = req.params.tourId || req.body.tour;

  if (!tourId) {
    return next(new AppError('You must provide a tour ID to review', 400));
  }

  // Check if user has booked this tour

  if(req.user.role === 'admin') {
    return next();
  }
  const booking = await Booking.findOne({ tour: tourId, user: currentUserId });

  if (!booking) {
    return next(new AppError('You can only review tours you have booked', 403));
  }

  next();
});

// Verify that the current user owns the review
const verifyReviewOwnership = catchAsync(async (req, res, next) => {
  if (!req.user) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  const currentUserId = req.user.id;
  const reviewId = req.params.id || req.params.reviewId;

  if (!reviewId) {
    return next(new AppError('You must provide a review ID', 400));
  }

  const review = await Review.findById(reviewId);

  if (!review) {
    return next(new AppError('Review not found', 404));
  }

  // Check ownership - admins can access any review
  if (review.user.id !== currentUserId && req.user.role !== 'admin') {
    return next(
      new AppError('You do not have permission to perform this action', 403)
    );
  }

  req.review = review;
  next();
});

export default {
  verifyBookingOwnership,
  verifyTourForReview,
  verifyReviewOwnership,

};
