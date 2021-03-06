const {
  GraphQLEnumType,
  GraphQLObjectType,
  GraphQLSchema,
} = require('graphql');
const TypesRegistry = require('./TypesRegistry');
const createScalarType = require('./utils/createScalarType');
const createNodeDefinitions = require('./utils/createNodeDefinitions');
const createObjectType = require('./utils/createObjectType');
const createInputObjectType = require('./utils/createInputObjectType');
const createInterfaceType = require('./utils/createInterfaceType');
const createNodeType = require('./utils/createNodeType');
const createConnectionType = require('./utils/createConnectionType');
const createMutationType = require('./utils/createMutationType');

const lowerCaseFirst = (string) => string[0].toLowerCase() + string.substr(1);

module.exports = class SchemaBuilder {
  constructor() {
    this.typesRegistry = new TypesRegistry();
    this.rootFields = {};
    this.mutations = {};
    this.nodeDefinitions = createNodeDefinitions(this.typesRegistry);
    this.typesRegistry.registerType('Node', this.nodeDefinitions.nodeInterface);
  }

  _createType(typeFactory, definition) {
    const { typesRegistry } = this;
    const type = typeFactory({ typesRegistry, definition });
    typesRegistry.registerType(definition.name, type);
  }

  createScalarType(definition) {
    this._createType(createScalarType, definition);
  }

  createEnumType(definition) {
    const type = new GraphQLEnumType(definition);
    this.typesRegistry.registerType(definition.name, type);
  }

  createObjectType(definition) {
    this._createType(createObjectType, definition);
  }

  createInputObjectType(definition) {
    this._createType(createInputObjectType, definition);
  }

  createInterfaceType(definition) {
    this._createType(createInterfaceType, definition);
  }

  createNodeType(definition) {
    this._createType(createNodeType, definition);
  }

  createConnectionType(definition) {
    if (!/Connection$/.test(definition.name)) {
      throw new Error('Connection name must end with with "Connection"');
    }
    const baseName = definition.name.replace(/Connection$/, '');
    const { typesRegistry } = this;
    const { connectionType, edgeType } = createConnectionType({
      typesRegistry,
      definition,
      baseName,
    });
    typesRegistry.registerType(definition.name, connectionType);
    typesRegistry.registerType(`${baseName}Edge`, edgeType);
  }

  createRootField(definition) {
    this.rootFields[definition.name] = definition;
  }

  createMutation(definition) {
    const { typesRegistry } = this;
    const fieldName = definition.fieldName || lowerCaseFirst(definition.name);
    const mutation = createMutationType({ typesRegistry, definition });
    this.mutations[fieldName] = mutation;
  }

  getSchema() {
    const schemaConfig = {
      query: createObjectType({
        typesRegistry: this.typesRegistry,
        definition: {
          name: 'QueryRoot',
          fields: this.rootFields,
        },
        baseFields: {
          node: this.nodeDefinitions.nodeField,
          nodes: this.nodeDefinitions.nodesField,
        },
      }),
    };

    if (Object.keys(this.mutations).length > 0) {
      schemaConfig.mutation = new GraphQLObjectType({
        name: 'Mutation',
        fields: this.mutations,
      });
    }

    return new GraphQLSchema(schemaConfig);
  }
};
