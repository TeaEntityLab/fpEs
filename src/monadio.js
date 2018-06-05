

module.exports = {
  asof: function (ref) {
    return Promise.resolve(ref);
  },
  doM: function (genDef) {
    var gen = genDef();
    function step(value) {
        var result = gen.next(value);
        if (result.done) {
            return result.value;
        }
        return result.value.then(step);
    }
    return step();
  },
};
