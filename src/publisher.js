class Publisher {
  constructor() {
    this.subscribers = [];
  }

  flatMap(fn) {
    var next = new Publisher();
    next.origin = this;

    return this.subscribe((val) => {
      next.publish(fn(val));
    });
  }
  subscribe(fn) {
    this.subscribers.push(fn);
  }
  unsubscribe(fn) {
    this.subscribers = this.subscribers.filter((item)=>item!==fn);
  }
  publish(result,asynchronized) {
    this.subscribers.forEach((fn)=>asynchronized ? Promise.resolve(result).then(fn) : fn(result));
  }
}

module.exports = Publisher;
