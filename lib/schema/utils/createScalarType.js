const { Kind, print } = require('graphql/language');
const { GraphQLError } = require('graphql/error');
const { GraphQLScalarType } = require('graphql');

function getParseLiteral({
  name,
  parseLiteral,
  validKinds,
  parseValue,
}) {
  if (parseLiteral) {
    return parseLiteral;
  }
  if (validKinds) {
    const formattedKinds = validKinds.map((kind) => {
      if (typeof kind === 'string') {
        const formattedKind = Kind[kind];
        if (!formattedKind) {
          throw new Error(`Invalid kind: "${kind}". Must be one of "${Object.keys(Kind).join('", "')}".`);
        }
        return formattedKind;
      }
      return kind;
    });
    return (valueNode) => {
      for (const kind of formattedKinds) {
        if (valueNode.kind === kind) {
          let { value } = valueNode;
          if (kind === Kind.INT) {
            value = parseInt(value, 10);
          } else if (kind === Kind.FLOAT) {
            value = parseFloat(value, 10);
          }
          return parseValue(value);
        }
      }
      throw new GraphQLError(
        `${name} cannot represent value: ${print(valueNode)}`,
        valueNode,
      );
    };
  }
  throw new Error('"parseLiteral" or "validKinds" must be passed in scalar type definition');
}

module.exports = ({
  definition,
}) => new GraphQLScalarType({
  name: definition.name,
  description: definition.name,
  serialize: definition.serialize || definition.parseValue,
  parseValue: definition.parseValue,
  parseLiteral: getParseLiteral(definition),
});
