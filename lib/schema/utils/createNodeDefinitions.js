const { nodeDefinitions, fromGlobalId } = require('graphql-relay');

module.exports = (typesRegistry) => nodeDefinitions(
  (globalId, context, info) => {
    const { type: typeName, id } = fromGlobalId(globalId);
    const type = typesRegistry.getType(typeName);

    if (typeof type.checkAccess === 'function' && !type.checkAccess(context, id, info)) {
      return null;
    }

    return {
      __type: typeName,
      id,
    };
  },

  (object) => (object.__type ? typesRegistry.getType(object.__type) : null),
);
