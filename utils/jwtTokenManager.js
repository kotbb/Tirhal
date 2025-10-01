import jwt from 'jsonwebtoken';
import { setCookie } from './cookieManager.js';

// Signing a token with the user id and the secret key and the expiration time
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
const signRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
  });
};

// Set tokens as cookies without sending response (for middleware use)
const setTokenCookies = async (user, req, res) => {
  const newAccessToken = signToken(user._id);
  const newRefreshToken = signRefreshToken(user._id);

  // Save the refresh token to the user
  user.refreshToken = newRefreshToken;
  await user.save({ validateBeforeSave: false });

  setCookie(
    req,
    res,
    'refreshToken',
    newRefreshToken,
    process.env.REFRESH_TOKEN_EXPIRES_IN
  );

  setCookie(
    req,
    res,
    'accessToken',
    newAccessToken,
    process.env.JWT_EXPIRES_IN
  );

  user.password = undefined;
  user.refreshToken = undefined;

  return { newAccessToken, newRefreshToken };
};
const createSendToken = async (user, statusCode, req, res) => {
  const { newAccessToken, newRefreshToken } = await setTokenCookies(
    user,
    req,
    res
  );
  res.status(statusCode).json({
    status: 'success',
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    data: { user },
  });
};

export { createSendToken, setTokenCookies, signToken, signRefreshToken };
