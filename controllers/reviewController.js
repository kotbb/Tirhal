import Review from '../models/reviewModel.js';
//const AppError = require('../utils/appError');
//const catchAsync = require('../utils/catchAsync');
import factory from './handlerFactory.js';
//---------------------------------------------------

const setTourUserIds = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

const createReview = factory.createOne(Review);

const getReview = factory.getOne(Review);

const getAllReviews = factory.getAll(Review);

const updateReview = factory.updateOne(Review);

const deleteReview = factory.deleteOne(Review);

export default {
  setTourUserIds,
  createReview,
  getAllReviews,
  getReview,
  updateReview,
  deleteReview,
};
