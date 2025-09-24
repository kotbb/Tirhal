export default (fn) => {
  return (req, res, next) => {
    // .catch(next) is equivalent to .catch(err => next(err)).
    // JavaScript automatically passes the error to next.
    fn(req, res, next).catch(next);
  };
};
