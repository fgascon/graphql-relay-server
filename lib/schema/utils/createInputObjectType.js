const { GraphQLInputObjectType } = require('graphql');
const mapObject = require('./mapObject');
const inputFields = require('./inputFields');

module.exports = ({ typesRegistry, definition }) => {
  const { name, description, fields } = definition;
  const fieldsThunk = inputFields({ typesRegistry, fields });
  const type = new GraphQLInputObjectType({
    name,
    description,
    fields: fieldsThunk,
  });
  type.transform = (value) => {
    const fieldsConfig = fieldsThunk();
    if (value && typeof value === 'object') {
      return mapObject(value, (fieldName, fieldValue) => {
        const field = fieldsConfig[fieldName];
        const transform = field && typeof field.transform === 'function' ? field.transform : null;
        return transform ? transform(fieldValue) : fieldValue;
      });
    }

    return value;
  };

  return type;
};
