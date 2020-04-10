const { connectionDefinitions } = require('graphql-relay');
const outputFields = require('./outputFields');

module.exports = ({ typesRegistry, definition }) => {
  const strippedName = definition.name.replace(/Connection$/, '');
  const config = {
    name: definition.name,
    nodeType: typesRegistry.getType(definition.nodeType || strippedName),
    resolveNode: definition.resolveNode,
    resolveCursor: definition.resolveCursor,
  };

  if (definition.edgeFields) {
    config.edgeFields = outputFields({
      typesRegistry,
      typeName: definition.name,
      fields: definition.edgeFields,
    });
  }

  if (definition.connectionFields) {
    config.connectionFields = outputFields({
      typesRegistry,
      typeName: `${definition.name}Edge`,
      fields: definition.connectionFields,
    });
  }

  return connectionDefinitions(config);
};
