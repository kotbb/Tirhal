import Tour from '../models/tourModel.js';
import Booking from '../models/bookingModel.js';
import Review from '../models/reviewModel.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import User from '../models/userModel.js';
import Stripe from 'stripe';

const getOverview = catchAsync(async (req, res, next) => {
  // 1) Get tour data from collection
  const tours = await Tour.find();

  // 2) Build template
  // 3) Render that template using tour data from step 1
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

const getTour = catchAsync(async (req, res, next) => {
  // 1) Get the data, for the requested tour (including reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    select: 'review rating user',
  });

  if (!tour) {
    return next(new AppError('There is no tour with that name.', 404));
  }

  // 3) Render that template using tour data from step 1

  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  });
});

const getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
};

const getSignupForm = (req, res) => {
  res.status(200).render('signup', {
    title: 'Sign up for your account',
  });
};

const getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account',
  });
};

const getMyTours = catchAsync(async (req, res, next) => {

  if (req.query.session_id) {
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
  
    if (
      session &&
      session.payment_status === 'paid' &&
      session.customer_email === req.user.email
    ) {
      const existing = await Booking.findOne({
        stripeSessionId: session.id,
      });

      if (!existing) {
        await Booking.create({
          tour: session.client_reference_id,
          user: req.user.id,
          price: session.amount_total / 100,
          stripeSessionId: session.id,
        });
      }
    }
  }

  // 1) Find all bookings
  const bookings = await Booking.find({ user: req.user.id });

  // 2) Find tours with the returned IDs
  const tourIds = bookings.map((booking) => booking.tour);

  const tours = await Tour.find({ _id: { $in: tourIds } });

  // 3) Render template using data from 1 and 2
  res.status(200).render('overview', {
    title: 'My Tours',
    tours,
  });
});

const getMyReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find({ user: req.user.id });
  res.status(200).render('reviews', {
    title: 'My Reviews',
    reviews,
  });
});

const updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser,
  });
});

const alerts = (req, res, next) => {
  const { alert } = req.query;
  if (alert === 'booking') {
    res.locals.alert =
      "Your booking was successful! Please check your email for a confirmation. If your booking doesn't show up here immediately, please come back later.";
  }
  next();
};

export default {
  getOverview,
  getTour,
  getLoginForm,
  getSignupForm,
  getAccount,
  getMyTours,
  getMyReviews,
  updateUserData,
  alerts,
};
