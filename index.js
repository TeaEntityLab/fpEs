module.exports = {
  Monad: require('./src/monad'),
  MonadIO: require('./src/monadio'),
  Publisher: require('./src/publisher'),
  ...require('./src/fp'),
  ...require('./src/pattern'),
};
