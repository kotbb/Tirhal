import express from 'express';
import reviewController from '../controllers/reviewController.js';
import authController from '../controllers/authController.js';
import authorController from '../controllers/authorController.js';

const router = express.Router({ mergeParams: true });

// Protect all routes after this middleware
router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo('user', 'admin'),
    reviewController.setTourUserIds,
    authorController.verifyTourForReview,
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    authorController.verifyReviewOwnership,
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    authorController.verifyReviewOwnership,
    reviewController.deleteReview
  );

export default router;
