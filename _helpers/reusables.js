module.exports = {
    getMainAndFollower: function(values) {
        let lastButOneValue = (+values[values.length-2])-1;
        let lastButOne = lastButOneValue >=0 ? lastButOneValue : 0;
      
        let lastValue = (+values[values.length-1])-1;
        let lastOne = lastValue >=0 ? lastValue : 1;
    
        let main = values[lastButOne];
        let follower = values[lastOne];
    
        return {main, follower}
    }
}