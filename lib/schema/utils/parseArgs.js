const parseGlobalId = require('./parseGlobalId');

module.exports = (argsConfig, args, context) => {
  const result = {
    ...args,
  };
  Object.keys(argsConfig).forEach((argName) => {
    const { transform, type, idType } = argsConfig[argName];
    let value = args[argName];
    if (idType && value) {
      const parseId = parseGlobalId({ type, idType });
      value = parseId(value);
    }

    if (typeof transform === 'function') {
      value = transform(value, args, context);
    }

    result[argName] = value;
  });
  return result;
};
