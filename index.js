module.exports = {
  Maybe: require('./maybe'),
  MonadIO: require('./monadio'),
  Publisher: require('./publisher'),
  ...require('./fp'),

  ...require('./pattern'),
};
