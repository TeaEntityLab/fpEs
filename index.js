module.exports = {
  Monad: require('./src/monad'),
  Publisher: require('./src/publisher'),
  ...require('./src/monadio'),
  ...require('./src/fp'),
};
