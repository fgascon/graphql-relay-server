const NodeTypeResolver = require('./NodeTypeResolver');

module.exports = class NodeResolvers {
  constructor() {
    this._resolvers = new Map();
  }

  register(typeName, resolvers) {
    this._resolvers.set(typeName, new NodeTypeResolver(typeName, resolvers));
  }

  resolve(context, typeName, id, fieldNames) {
    const nodeResolver = this._resolvers.get(typeName);
    if (!nodeResolver) {
      throw new Error(`Missing node resolver for type: "${typeName}".`);
    }
    return nodeResolver.resolve(context, id, fieldNames);
  }
};
