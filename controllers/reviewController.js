const Review = require('../models/reviewModel');
//const AppError = require('../utils/appError');
//const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
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

module.exports = {
  setTourUserIds,
  createReview,
  getAllReviews,
  getReview,
  updateReview,
  deleteReview,
};
