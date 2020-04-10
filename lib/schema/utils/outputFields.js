const processFieldsConfig = require('./processFieldsConfig');
const outputField = require('./outputField');

module.exports = function outputFields({
  typesRegistry,
  typeName,
  fields,
  baseFields,
  resolveField,
}) {
  return processFieldsConfig(fields, (fieldName, fieldConfig) => (
    outputField(typesRegistry, typeName, fieldName, fieldConfig, resolveField)
  ), baseFields);
};
