const { getOffsetWithDefault, offsetToCursor } = require('graphql-relay');

function connectionFromEdges(arraySlice, args) {
  const {
    after, before, first, last,
  } = args;
  const arrayLength = arraySlice.length;
  const beforeOffset = getOffsetWithDefault(before, arrayLength);
  const afterOffset = getOffsetWithDefault(after, -1);

  let startOffset = Math.max(-1, afterOffset) + 1;
  let endOffset = Math.min(arrayLength, beforeOffset);
  if (typeof first === 'number') {
    if (first < 0) {
      throw new Error('Argument "first" must be a non-negative integer');
    }

    endOffset = Math.min(
      endOffset,
      startOffset + first,
    );
  }

  if (typeof last === 'number') {
    if (last < 0) {
      throw new Error('Argument "last" must be a non-negative integer');
    }

    startOffset = Math.max(
      startOffset,
      endOffset - last,
    );
  }

  // If supplied slice is too large, trim it down before mapping over it.
  const slice = arraySlice.slice(startOffset, endOffset);

  const edges = slice.map((value, index) => ({
    ...value.edge,
    cursor: offsetToCursor(startOffset + index),
    node: value.node,
  }));

  const firstEdge = edges[0];
  const lastEdge = edges[edges.length - 1];
  const lowerBound = after ? (afterOffset + 1) : 0;
  const upperBound = before ? beforeOffset : arrayLength;
  return {
    edges,
    pageInfo: {
      startCursor: firstEdge ? firstEdge.cursor : null,
      endCursor: lastEdge ? lastEdge.cursor : null,
      hasPreviousPage: typeof last === 'number' ? startOffset > lowerBound : false,
      hasNextPage: typeof first === 'number' ? endOffset < upperBound : false,
    },
  };
}

module.exports = async function connectionFromPromisedEdges(promise, args) {
  const data = await Promise.resolve(promise);
  return connectionFromEdges(data, args);
};
