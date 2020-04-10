
function getNodeFieldKey(typeName, id, fieldName) {
  return `${typeName}.${id}.${fieldName}`;
}

module.exports = class QueryCache {
  constructor() {
    this._data = new Map();
  }

  _getOrElse(key, valueLoader) {
    const data = this._data;
    if (data.has(key)) {
      return data.get(key);
    }
    const value = Promise.resolve(valueLoader());
    data.set(key, value);
    return value;
  }

  getFieldOrElse(typeName, id, fieldName, valueLoader) {
    const key = getNodeFieldKey(typeName, id, fieldName);
    return this._getOrElse(key, valueLoader);
  }

  setNodeFields(typeName, values) {
    const { id } = values;
    const data = this._data;
    Object.keys(values).forEach((fieldName) => {
      const key = getNodeFieldKey(typeName, id, fieldName);
      if (!data.has(key)) {
        data.set(key, Promise.resolve(values[fieldName]));
      }
    });
  }
};
