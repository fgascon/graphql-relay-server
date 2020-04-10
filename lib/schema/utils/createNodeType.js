const { globalIdField } = require('graphql-relay');
const createObjectType = require('./createObjectType');

module.exports = ({ typesRegistry, definition }) => createObjectType({
  typesRegistry,
  definition: {
    ...definition,
    interfaces: ['Node'].concat(definition.interfaces || []),
  },
  baseFields: {
    id: globalIdField(definition.name, definition.idFetcher),
  },
  resolveField: (object, fieldName, fieldArgs, { queryResolver }) => (
    queryResolver.resolveNodeField(definition.name, object, fieldName)
  ),
});
