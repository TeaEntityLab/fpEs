class Publisher {
  constructor() {
    this.subscribers = [];
  }

  flatMap(fn) {
    var next = new Publisher();
    next.origin = this;

    this.subscribe((val) => {
      next.publish(fn(val));
    });
    return next;
  }
  subscribe(fn) {
    if (this.subscribers.includes(fn)) {
      return;
    }

    this.subscribers.push(fn);
    return fn;
  }
  unsubscribe(fn) {
    this.subscribers = this.subscribers.filter((item)=>item!==fn);
  }
  publish(result,asynchronized) {
    this.subscribers.forEach((fn)=>asynchronized ? Promise.resolve(result).then(fn) : fn(result));
  }
}

module.exports = Publisher;
