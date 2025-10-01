import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import { promisify } from 'util';
import { createSendToken, setTokenCookies } from '../utils/jwtTokenManager.js';

const generateRefreshAccessToken = async (req, res) => {
  // 1) Get refresh token from cookie
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    throw new AppError(
      'You are not logged in! Please log in to get access.',
      401
    );
  }
  // 2) Verify the refresh token and get user from refresh token
  const currentUser = await User.findOne({ refreshToken });
  const decoded = await promisify(jwt.verify)(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  // 3) If the token is not in DB, or has been reused, return an error
  if (!currentUser || currentUser.refreshToken !== refreshToken) {
    if (currentUser) {
      currentUser.refreshToken = undefined;
      await currentUser.save({ validateBeforeSave: false });
    }
    throw new AppError('Forbidden. Please log in again!', 403);
  }
  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    throw new AppError(
      'User recently changed password! Please log in again.',
      401
    );
  }

  // 5) Create new access token and Refresh token (Rotation)
  const { newAccessToken, newRefreshToken } = await setTokenCookies(
    currentUser,
    req,
    res
  );
  return { newAccessToken, newRefreshToken };
};

const verifyTokenAndGetUser = async (token, secret) => {
  if (!token) return null;
  try {
    // 1 Verification token
    const decoded = await promisify(jwt.verify)(token, secret);

    // 2) Check if user still exists, this is to prevent someone from using the token after the user deleted his account.
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return null;
    }

    // 3) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return null;
    }
    return currentUser;
  } catch (err) {
    return null;
  }
};

export { generateRefreshAccessToken, verifyTokenAndGetUser };
