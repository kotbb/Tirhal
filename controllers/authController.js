import User from '../models/userModel.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import Email from '../utils/email.js';
import { createSendToken, setTokenCookies } from '../utils/jwtTokenManager.js';
import { setCookie } from '../utils/cookieManager.js';
import {
  generateRefreshAccessToken,
  verifyTokenAndGetUser,
} from './jwtTokensController.js';
//---------------------------------------------------------------

const logout = catchAsync(async (req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  // Clear the refresh token from the user
  if (req.user) {
    req.user.refreshToken = undefined;
    await req.user.save({ validateBeforeSave: false });
  }

  setCookie(
    req,
    res,
    'refreshToken',
    'loggedout',
    process.env.LOGGED_OUT_COOKIE_EXPIRES_IN
  );
  setCookie(
    req,
    res,
    'accessToken',
    'loggedout',
    process.env.LOGGED_OUT_COOKIE_EXPIRES_IN
  );

  res.status(200).json({ status: 'success' });
});

// Signing up a new user
const signUp = catchAsync(async (req, res, next) => {
  // This is better than using req.body because it is more secure and we can input the data that we want to create only.
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });
  const url = `${req.protocol}://${req.get('host')}/me`;
  await new Email(newUser, url).sendWelcome();
  // jwt.sign(payload,secret,options)
  createSendToken(newUser, 201, req, res);
});

// Logging in a user
const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  // 2) Check if user exists and password is correct
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password!', 401));
  }

  // 3) If everything is ok, send token to client
  createSendToken(user, 200, req, res);
});

// Protecting routes
const protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if it's there
  let accessToken;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    accessToken = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.accessToken) {
    accessToken = req.cookies.accessToken;
  }
  // 2) Verify access token and get user
  let currentUser = await verifyTokenAndGetUser(
    accessToken,
    process.env.JWT_SECRET
  );
  // 3) If access token is invalid, try generate new access token with refresh token
  if (!currentUser) {
    const { newAccessToken, newRefreshToken } =
      await generateRefreshAccessToken(req, res);
    currentUser = await verifyTokenAndGetUser(
      newRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
  }
  // ** IMPORTANT ** Transfer the user to the next middlewares
  if (currentUser) {
    req.user = currentUser;
    res.locals.user = currentUser;
  }
  // GRANT ACCESS TO PROTECTED ROUTE
  next();
});

// Protecting routes
const isLoggedIn = catchAsync(async (req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return next();
  const currentUser = await verifyTokenAndGetUser(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );
  if (currentUser) {
    res.locals.user = currentUser;
  }
  next();
});

// Restricting access to certain roles
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

export default {
  signUp,
  login,
  logout,
  protect,
  isLoggedIn,
  restrictTo,
};
