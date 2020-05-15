
module.exports = (typesRegistry, args) => {
  const preparedArgs = {};
  if (args) {
    Object.keys(args).forEach((fieldName) => {
      const argConfig = args[fieldName];
      preparedArgs[fieldName] = {
        ...argConfig,
        type: typesRegistry.getType(argConfig.type),
      };
    });
  }
  return preparedArgs;
};
