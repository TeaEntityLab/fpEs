module.exports = {
  Monad: require('./monad'),
  MonadIO: require('./monadio'),
  Publisher: require('./publisher'),
  ...require('./fp'),

  ...require('./pattern'),
};
