import express from 'express';

import userController from '../controllers/userController.js';
import authController from '../controllers/authController.js';
import passwordController from '../controllers/passwordController.js';
import { generateRefreshAccessToken } from '../controllers/jwtTokensController.js';
const router = express.Router();

router.post('/signup', authController.signUp);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotPassword', passwordController.forgotPassword);
router.patch('/resetPassword/:token', passwordController.resetPassword);
router.post('/refreshToken', generateRefreshAccessToken);

// Protect all routes after this middleware
router.use(authController.protect);

router.get('/me', userController.getMe, userController.getUser);
router.patch('/updateMyPassword', passwordController.updatePassword);
router.patch(
  '/updateMe',
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);
router.delete('/deleteMe', userController.deleteMe);

// Restrict all routes after this middleware to admin
router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

// POST /tour/123456/reviews          // create a review with the id of tour and id of logged in user
// GET /tour/123456/reviews           // get all reviews for the tour with the id of tour
// GET /tour/123456/reviews/123456    // get a review with the id of review

export default router;
