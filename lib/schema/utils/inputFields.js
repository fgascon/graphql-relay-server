const processFieldsConfig = require('./processFieldsConfig');
const parseGlobalId = require('./parseGlobalId');

// default transform when no transform is provided
const identityTransform = (value) => value;

module.exports = function inputFields({ typesRegistry, fields: fieldsConfig }) {
  return processFieldsConfig(fieldsConfig, (fieldName, fieldConfig) => {
    const type = typesRegistry.getType(fieldConfig.type);
    const field = {
      description: fieldConfig.description,
      type,
      transform: fieldConfig.transform || type.transform,
      // args: options.args ? prepareArgs(typesRegistry, options.args) : null,
    };

    if (fieldConfig.idType) {
      const previousTransform = field.transform || identityTransform;
      const parseId = parseGlobalId({
        type,
        idType: fieldConfig.idType,
      });
      field.transform = (value) => previousTransform(parseId(value));
    }

    return field;
  });
};
