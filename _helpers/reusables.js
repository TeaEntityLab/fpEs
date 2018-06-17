module.exports = {
    getMainAndFollower: function(values) {
        let lastButOneValue = (+values[values.length-2])-1;
        let lastButOne = lastButOneValue >=0 ? lastButOneValue : 0;

        let lastValue = (+values[values.length-1])-1;
        let lastOne = lastValue >=0 ? lastValue : 1;

        let main = values[lastButOne];
        let follower = values[lastOne];

        return {main, follower}
    },
    findArrayEntry: function(f, list) {
      for (let entry of list.entries()) {
        if (f(entry[1])) {
          return entry;
        }
      }
    },
    findLastArrayEntry: function(f, list) {
      for (var i = list.length - 1; i >= 0; i--) {
        if (f(list[i])) {
          return [i, list[i]];
        }
      }
    },
}
