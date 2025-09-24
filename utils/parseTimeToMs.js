module.exports = (time) => {
  const timeUnit = time.slice(-1);
  const timeValue = parseInt(time.slice(0, -1));
  switch (timeUnit) {
    case 's':
      return timeValue * 1000;
    case 'm':
      return timeValue * 60 * 1000;
    case 'h':
      return timeValue * 60 * 60 * 1000;
    case 'd':
      return timeValue * 24 * 60 * 60 * 1000;
    // default is minutes
    default:
      return timeValue * 60 * 1000;
  }
};
