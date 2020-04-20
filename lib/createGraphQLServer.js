const expressGraphql = require('express-graphql');
const { printSchema, printIntrospectionSchema } = require('graphql/utilities');
const SchemaBuilder = require('./schema/SchemaBuilder');
const DataResolver = require('./dataResolver/DataResolver');

function createGraphQLServer(options = {}) {
  const schemaBuilder = new SchemaBuilder();
  const dataResolver = new DataResolver();

  return {
    createEnumType(definition) {
      schemaBuilder.createEnumType(definition);
    },
    createObjectType(definition) {
      schemaBuilder.createObjectType(definition);
    },
    createInputObjectType(definition) {
      schemaBuilder.createInputObjectType(definition);
    },
    createInterfaceType(definition) {
      schemaBuilder.createInterfaceType(definition);
    },
    createNodeType(definition) {
      schemaBuilder.createNodeType(definition);
      if (definition.resolvers) {
        dataResolver.registerNodeResolvers(definition.name, definition.resolvers);
      }
    },
    createConnectionType(definition) {
      schemaBuilder.createConnectionType(definition);
    },
    createRootField(definition) {
      schemaBuilder.createRootField(definition);
    },
    createMutation(definition) {
      schemaBuilder.createMutation(definition);
    },
    getSchema() {
      return schemaBuilder.getSchema();
    },
    printSchema() {
      return printSchema(this.getSchema());
    },
    printIntrospectionSchema() {
      return printIntrospectionSchema(this.getSchema());
    },
    middleware() {
      const schema = this.getSchema();
      const rootValue = {};
      const createContext = options.context || (async () => ({}));
      return expressGraphql(async (req) => {
        const context = await createContext(req);
        context.queryResolver = dataResolver.createQueryResolver(context);
        return {
          schema,
          rootValue,
          graphiql: true,
          context,
          customFormatErrorFn: options.formatError,
        };
      });
    },
  };
}

module.exports = createGraphQLServer;
