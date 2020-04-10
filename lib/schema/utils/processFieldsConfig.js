const resolveThunk = require('./resolveThunk');
const mapObject = require('./mapObject');

// lazyThunk uses the lazy loading pattern to transform the thunk, avoid calling it multiple time.
function lazyThunk(thunk) {
  let resolved = null;
  return () => {
    if (!resolved) {
      resolved = thunk();
    }
    return resolved;
  };
}

function processFieldsConfig(fieldsConfig, processField, baseFields = {}) {
  return lazyThunk(() => {
    const resolvedFieldsConfig = resolveThunk(fieldsConfig);
    const fields = mapObject(resolvedFieldsConfig, processField);
    return {
      ...baseFields,
      ...fields,
    };
  });
}

module.exports = processFieldsConfig;
