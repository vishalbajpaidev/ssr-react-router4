'use strict';
function sequence(items, consumer) {
  const results = [];
  function runner(){
    const item = items.shift();
    if (item) {
      return consumer(item)
          .then((result) => {
            results.push(result);
          })
          .then(runner);
    }
    return Promise.resolve(results);
  };
  return runner();
}

exports.default = sequence;
