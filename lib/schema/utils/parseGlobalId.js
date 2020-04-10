const { GraphQLList } = require('graphql');
const { fromGlobalId } = require('graphql-relay');

module.exports = ({ idType, type: fieldType }) => {
  const parseId = (globalId) => {
    if (!globalId) {
      return null;
    }

    const { type, id } = fromGlobalId(globalId);
    if (type !== idType) {
      throw new Error(`The provided ${idType} ID "${globalId}" is not a valid ${idType} ID.`);
    }

    return id;
  };

  const isList = fieldType && (
    fieldType instanceof GraphQLList || fieldType.ofType instanceof GraphQLList
  );

  return isList ? (list) => list.map(parseId) : parseId;
};
