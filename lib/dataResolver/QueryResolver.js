const QueryCache = require('./QueryCache');

module.exports = class QueryResolver {
  constructor({ nodeResolvers, context }) {
    this._nodeResolvers = nodeResolvers;
    this._context = context;
    this._queryCache = new QueryCache();
    this._scheduledResolveJobs = null;

    this._executeResolveJobs = this._executeResolveJobs.bind(this);
  }

  _executeResolveJobs() {
    const resolveJobs = this._scheduledResolveJobs;
    this._scheduledResolveJobs = null;

    const entities = new Map();
    resolveJobs.forEach(({
      typeName,
      id,
      fieldName,
      resolve,
      reject,
    }) => {
      const entityKey = `${typeName}:${id}`;
      const field = {
        fieldName,
        resolve,
        reject,
      };
      if (entities.has(entityKey)) {
        entities.get(entityKey).fields.push(field);
      } else {
        entities.set(entityKey, {
          typeName,
          id,
          fields: [field],
        });
      }
    });
    entities.forEach(({ typeName, id, fields }) => {
      const fieldNames = fields.map((field) => field.fieldName);
      try {
        const results = this._nodeResolvers.resolve(this._context, typeName, id, fieldNames);

        fields.forEach(({ fieldName, resolve, reject }) => {
          if (results && results[fieldName]) {
            if (typeof results[fieldName].then === 'function') {
              results[fieldName].then(resolve, reject);
            } else {
              resolve(results[fieldName]);
            }
          } else {
            resolve(null);
          }
        });
      } catch (error) {
        fields.forEach(({ reject }) => reject(error));
      }
    });
  }

  resolveNodeField(typeName, data, fieldName) {
    if (!data) {
      return Promise.resolve(null);
    }

    this._queryCache.setNodeFields(typeName, data);
    const { id } = data;
    return this._queryCache.getFieldOrElse(typeName, id, fieldName, () => {
      if (!this._scheduledResolveJobs) {
        this._scheduledResolveJobs = [];
        process.nextTick(this._executeResolveJobs);
      }

      return new Promise((resolve, reject) => {
        this._scheduledResolveJobs.push({
          typeName,
          id,
          fieldName,
          resolve,
          reject,
        });
      });
    });
  }
};
