
// check if the argument is a thunk and resolve it if it is
module.exports = (maybeThunk) => (
  typeof maybeThunk === 'function' ? maybeThunk() : maybeThunk
);
