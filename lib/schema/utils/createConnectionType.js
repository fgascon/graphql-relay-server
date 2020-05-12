const { connectionDefinitions } = require('graphql-relay');
const outputFields = require('./outputFields');

module.exports = ({ typesRegistry, definition, baseName }) => {
  const config = {
    name: baseName,
    nodeType: typesRegistry.getType(definition.nodeType || baseName),
    resolveNode: definition.resolveNode,
    resolveCursor: definition.resolveCursor,
  };

  if (definition.edgeFields) {
    config.edgeFields = outputFields({
      typesRegistry,
      typeName: `${baseName}Edge`,
      fields: definition.edgeFields,
    });
  }

  if (definition.connectionFields) {
    config.connectionFields = outputFields({
      typesRegistry,
      typeName: definition.name,
      fields: definition.connectionFields,
    });
  }

  return connectionDefinitions(config);
};
