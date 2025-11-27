import express from 'express';
import bookingController from '../controllers/bookingController.js';
import authController from '../controllers/authController.js';
import authorController from '../controllers/authorController.js';
const router = express.Router({ mergeParams: true });

router.use(authController.protect);

// User routes - users can access their own bookings
router.get('/checkout-session/:tourId', bookingController.getCheckoutSession);


router
  .route('/')
  .get(
    authController.restrictTo('admin', 'lead-guide'),
    bookingController.setTourUserIds,
    authorController.verifyGuideAccess,
    bookingController.getAllBookings
  );

router.post(
  '/',
  authController.restrictTo('admin'),
  bookingController.createBooking
);

router
  .route('/:id')
  .get(
    authController.restrictTo('admin', 'lead-guide'),
    authorController.verifyBookingOwnership,
    authorController.verifyGuideAccess,
    bookingController.getBooking
  )
  .patch(
    authController.restrictTo('admin'),
    authorController.verifyBookingOwnership,
    bookingController.updateBooking
  )
  .delete(
    authController.restrictTo('admin'),
    authorController.verifyBookingOwnership,
    bookingController.deleteBooking
  );

export default router;
