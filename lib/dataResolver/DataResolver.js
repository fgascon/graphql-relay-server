const QueryResolver = require('./QueryResolver');
const NodeResolvers = require('./nodeResolver/NodeResolvers');

module.exports = class DataResolver {
  constructor() {
    this._nodeResolvers = new NodeResolvers();
  }

  registerNodeResolvers(typeName, resolvers) {
    this._nodeResolvers.register(typeName, resolvers);
  }

  createQueryResolver(context) {
    return new QueryResolver({
      nodeResolvers: this._nodeResolvers,
      context,
    });
  }
};
