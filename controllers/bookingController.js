import Tour from '../models/tourModel.js';
import User from '../models/userModel.js';
import Booking from '../models/bookingModel.js';
import factory from './handlerFactory.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import Stripe from 'stripe';
import path from 'path';

const getCheckoutSession = catchAsync(async (req, res, next) => {

  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  // 1) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);

  const imageUrl = `${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`;

  // 2) Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}/my-tours?alert=booking&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        price_data: {
          currency: 'EGP',
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [imageUrl],
          },
          unit_amount: tour.price * 100,
        },
        quantity: 1,
      },
    ],
  });

  // 3) Create session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});

const createBookingCheckout = async (sessionData) => {
  const tour = sessionData.client_reference_id;
  const user = (await User.findOne({ email: sessionData.customer_email })).id;
  const price = sessionData.amount_total / 100;
  console.log('createBookingCheckout via webhook:', { tour, user, price, stripeSessionId: sessionData.id });

  const existing = await Booking.findOne({ stripeSessionId: sessionData.id });
  if (existing) return;

  await Booking.create({ tour, user, price, stripeSessionId: sessionData.id });
};

const webhookCheckout = catchAsync(async (req, res, next) => {
  
  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  const signature = req.headers['stripe-signature'];

  const webhookSecret =
    process.env.STRIPE_WEBHOOK_SECRET ||
    (process.env.NODE_ENV === 'production'
      ? process.env.STRIPE_WEBHOOK_SECRET_PROD
      : process.env.STRIPE_WEBHOOK_SECRET_DEV);

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (error) {
    return res.status(400).send(`Webhook error: ${error.message}`);
  }
  if (event.type === 'checkout.session.completed') {
    console.log("in checkout.session.completed");
    await createBookingCheckout(event.data.object);
  }
  res.status(200).json({ received: true });
});

const setTourUserIds = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};


const createBooking = factory.createOne(Booking);
const getBooking = factory.getOne(Booking);
const getAllBookings = factory.getAll(Booking);
const updateBooking = factory.updateOne(Booking);
const deleteBooking = factory.deleteOne(Booking);

export default {
  getCheckoutSession,
  webhookCheckout,
  createBooking,
  getBooking,
  getAllBookings,
  updateBooking,
  deleteBooking,
  setTourUserIds
};
