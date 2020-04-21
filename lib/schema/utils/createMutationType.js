const { mutationWithClientMutationId } = require('graphql-relay');
const inputFields = require('./inputFields');
const outputFields = require('./outputFields');
const mapObject = require('./mapObject');

module.exports = ({ typesRegistry, definition }) => {
  const inputFieldsThunk = inputFields({
    typesRegistry,
    fields: definition.inputFields,
  });
  const outputFieldsThunk = outputFields({
    typesRegistry,
    fields: definition.outputFields,
  });
  return mutationWithClientMutationId({
    name: definition.name,
    inputFields: inputFieldsThunk,
    outputFields: outputFieldsThunk,
    async mutateAndGetPayload(inputs, context) {
      const inputFieldsConfig = inputFieldsThunk();
      const outputFieldsConfig = outputFieldsThunk();

      // transform input
      const transformedInputs = mapObject(inputFieldsConfig, (fieldName, fieldConfig) => {
        const value = inputs[fieldName];
        if (typeof fieldConfig.transform === 'function') {
          return fieldConfig.transform(value, inputs, context);
        }
        return value;
      });

      const results = await definition.mutate(transformedInputs, context);

      // transform output
      return mapObject(outputFieldsConfig, (fieldName, fieldConfig) => {
        const value = results[fieldName];
        if (typeof fieldConfig.transform === 'function') {
          const fieldArgs = {};
          return fieldConfig.transform(value, fieldArgs, context);
        }
        return value;
      });
    },
  });
};
