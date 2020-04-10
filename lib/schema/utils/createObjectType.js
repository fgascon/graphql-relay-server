const { GraphQLObjectType } = require('graphql');
const outputFields = require('./outputFields');

module.exports = ({
  typesRegistry,
  definition,
  baseFields = {},
  resolveField,
}) => {
  const typeName = definition.name;
  const type = new GraphQLObjectType({
    name: typeName,
    description: definition.description,
    fields: outputFields({
      typesRegistry,
      typeName,
      fields: definition.fields,
      baseFields,
      resolveField,
    }),
    interfaces: typesRegistry.getTypes(definition.interfaces || []),
  });

  if (definition.checkAccess) {
    type.checkAccess = definition.checkAccess;
  }

  return type;
};
