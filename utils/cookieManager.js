import parseTimeToMs from './parseTimeToMs.js';

const setCookie = (req, res, tokenName, token, timeToExpire) => {
  const cookieOptions = {
    expires: new Date(Date.now() + parseTimeToMs(timeToExpire)),
    httpOnly: true,
    path: '/',
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    sameSite: process.env.NODE_ENV === 'production' ? 'lax' : '',
  };

  res.cookie(tokenName, token, cookieOptions);
};
export { setCookie };
