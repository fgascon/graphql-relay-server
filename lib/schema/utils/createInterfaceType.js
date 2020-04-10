const { GraphQLInterfaceType } = require('graphql');
const outputFields = require('./outputFields');

module.exports = ({ typesRegistry, definition }) => new GraphQLInterfaceType({
  name: definition.name,
  description: definition.description,
  fields: outputFields({
    typesRegistry,
    typeName: definition.name,
    fields: definition.fields,
  }),
  resolveType: (object) => (object.__type ? typesRegistry.getType(object.__type) : null),
});
