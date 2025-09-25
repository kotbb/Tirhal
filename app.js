import express from 'express';
import morgan from 'morgan';
import AppError from './utils/appError.js';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import cors from 'cors';
import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import globalErrorHandler from './controllers/errorController.js';
import tourRouter from './routes/tourRoutes.js';
import userRouter from './routes/userRoutes.js';
import reviewRouter from './routes/reviewRoutes.js';
import viewRouter from './routes/viewRoutes.js';
import bookingRouter from './routes/bookingRoutes.js';
import bookingController from './controllers/bookingController.js';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// this will handle static files and make it in the root in the browser if it doesn't find any route that handle the url if I want to open overview.htm => 127.0.0.1:3000/overview.html not 127.0.0.1:3000/public/overview.html
app.use(express.static(path.join(__dirname, 'public')));

// 1) Global Middlewares

// Enable Access Control Allow Origin for all routes, this will for get & post requests only
app.use(cors());

// to enable for other methods we should respond to the options request that the browser will send to the server to check if the server supports the request method when making put, patch, and delete requests
app.options('*', cors());

// Trust proxy
app.enable('trust proxy');

// set security http headers using HELMET
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
  })
);

// Further HELMET configuration for Security Policy (CSP)
const scriptSrcUrls = [
  'https://api.tiles.mapbox.com/',
  'https://api.mapbox.com/',
  'https://*.cloudflare.com',
  'https://unpkg.com/',
  'https://js.stripe.com',
  'https://checkout.stripe.com',
  'https://vercel.live',
];
const styleSrcUrls = [
  'https://api.mapbox.com/',
  'https://api.tiles.mapbox.com/',
  'https://fonts.googleapis.com/',
  'https://www.myfonts.com/fonts/radomir-tinkov/gilroy/*',
  'https://unpkg.com/',
];
const connectSrcUrls = [
  'https://*.mapbox.com/',
  'https://*.cloudflare.com',
  'http://127.0.0.1:3000',
  'https://unpkg.com/',
  'https://api.stripe.com',
  'https://checkout.stripe.com',
  'https://vercel.live',
];
const frameSrcUrls = [
  'https://js.stripe.com',
  'https://checkout.stripe.com',
  'https://vercel.live',
];

const fontSrcUrls = ['fonts.googleapis.com', 'fonts.gstatic.com'];

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      frameSrc: ["'self'", ...frameSrcUrls],
      workerSrc: ["'self'", 'blob:'],
      objectSrc: [],
      imgSrc: ["'self'", 'blob:', 'data:', 'https:', 'http:'],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

// Limit Requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

// Webhook Checkout, we need the body as it is in the request so we need to put it before the body parser that will convert the body to JSON
app.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  bookingController.webhookCheckout
);

// Development Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body Parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Form Data Parser
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Query Parser
app.set('query parser', 'extended'); // this will parse the query string into an object

// Cookie Parser
app.use(cookieParser());

// Data Sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data Sanitization against XSS
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

const dirtyInput =
  '<img src="x" onerror="alert(\'XSS\')"> <p>This is safe.</p>';
const cleanOutput = DOMPurify.sanitize(dirtyInput);
console.log(cleanOutput);

// Prevent Parameter Pollution, whitelist the parameters that we want to allow to be duplicated
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// Compression
app.use(compression());

// Middleware to add request time variable to the request object to be used by the next middlewares or routes.
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  //console.log(req.cookies);
  next();
});

//--------------------------------------

// Routes
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

// We put it here at the end , this means that all route handlers we have didn't handle it so we will send this response.
app.all('*', (req, res, next) => {
  /* res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`,
  }); */
  const err = new AppError(
    `Can't find ${req.originalUrl} on this server!`,
    404
  );
  next(err);
});

// Global Error Handling Middleware
app.use(globalErrorHandler);

//--------------------------------------
export default app;
